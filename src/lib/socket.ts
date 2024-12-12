// src/lib/socket.ts

import { Server } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import type { NextApiResponse } from 'next';
import { verifyToken } from './auth';
import { prisma } from './prisma';

interface SocketData {
    lessonId: string;
    slideIndex: number;
    pollId?: string;
    option?: string;
}

export const initSocketServer = (server: HTTPServer) => {
    const io = new Server(server, {
        path: '/api/socketio',
        addTrailingSlash: false,
        cors: {
            origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true
        },
        connectionStateRecovery: {
            maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutos
            skipMiddlewares: true,
        },
    });

    let connectedUsers = 0;

    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            const user = await verifyToken(token);

            if (!user) {
                return next(new Error('Unauthorized'));
            }

            socket.data.user = user;
            next();
        } catch (error) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', async (socket) => {
        const user = socket.data.user;

        try {
            connectedUsers++;
            io.emit('connected-users', connectedUsers);

            socket.on('join-lesson', async (lessonId: string) => {
                try {
                    socket.join(`lesson:${lessonId}`);

                    // Verifica se já existe uma presença ativa
                    const existingAttendance = await prisma.attendance.findFirst({
                        where: {
                            userId: user.id,
                            lessonId,
                            leftAt: null
                        }
                    });

                    // Só cria nova presença se não existir uma ativa
                    if (!existingAttendance) {
                        await prisma.attendance.create({
                            data: {
                                userId: user.id,
                                lessonId,
                                isGuest: !user.ward
                            }
                        });
                    }

                    // Emite o evento de participantes atualizados
                    const attendances = await prisma.attendance.findMany({
                        where: {
                            lessonId,
                            leftAt: null
                        },
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    ward: true
                                }
                            }
                        }
                    });

                    const participants = attendances.map(att => ({
                        userId: att.userId,
                        userName: att.user.name,
                        isGuest: att.isGuest,
                        joinedAt: att.joinedAt
                    }));

                    io.to(`lesson:${lessonId}`).emit('participants-update', { participants });
                    socket.emit('lesson-joined', { lessonId });
                } catch (error) {
                    console.error('Error joining lesson:', error);
                    socket.emit('error', { message: 'Failed to join lesson' });
                }
            });

            socket.on('slide-change', async (data: SocketData) => {
                try {
                    const { lessonId, slideIndex } = data;
                    
                    // Verifica se o usuário tem permissão para mudar o slide
                    const lesson = await prisma.lesson.findUnique({
                        where: { id: lessonId },
                        include: { teacher: true }
                    });

                    if (lesson?.teacherId !== user.id) {
                        throw new Error('Unauthorized to change slides');
                    }

                    await prisma.lesson.update({
                        where: { id: lessonId },
                        data: { currentSlide: slideIndex }
                    });

                    socket.to(`lesson:${lessonId}`).emit('slide-changed', { slideIndex });
                } catch (error) {
                    console.error('Error changing slide:', error);
                    socket.emit('error', { message: 'Failed to change slide' });
                }
            });

            socket.on('raise-hand', async (lessonId: string) => {
                try {
                    const handRaise = await prisma.handRaise.create({
                        data: {
                            userId: user.id,
                            lessonId,
                            resolved: false
                        },
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        }
                    });

                    io.to(`lesson:${lessonId}`).emit('hand-raised', handRaise);
                } catch (error) {
                    console.error('Error raising hand:', error);
                    socket.emit('error', { message: 'Failed to raise hand' });
                }
            });

            socket.on('vote', async (data: SocketData) => {
                try {
                    const { lessonId, pollId, option } = data;
                    if (!pollId || !option) return;

                    await prisma.vote.create({
                        data: {
                            userId: user.id,
                            resourceId: pollId,
                            option
                        }
                    });

                    const votes = await prisma.vote.groupBy({
                        by: ['option'],
                        where: { resourceId: pollId },
                        _count: true
                    });

                    io.to(`lesson:${lessonId}`).emit('poll-updated', { pollId, votes });
                } catch (error) {
                    console.error('Error voting:', error);
                    socket.emit('error', { message: 'Failed to register vote' });
                }
            });

            socket.on('disconnecting', async () => {
                try {
                    const rooms = Array.from(socket.rooms);
                    const lessonRoom = rooms.find(room => room.startsWith('lesson:'));

                    if (lessonRoom) {
                        const lessonId = lessonRoom.split(':')[1];
                        await prisma.attendance.updateMany({
                            where: {
                                userId: user.id,
                                lessonId,
                                leftAt: null
                            },
                            data: { leftAt: new Date() }
                        });
                    }

                    connectedUsers = Math.max(0, connectedUsers - 1);
                    io.emit('connected-users', connectedUsers);
                } catch (error) {
                    console.error('Error handling disconnection:', error);
                }
            });

            socket.on('error', (error) => {
                console.error('Socket error:', error);
                socket.emit('error', { message: 'Internal server error' });
            });

        } catch (error) {
            console.error('Socket connection error:', error);
            socket.disconnect(true);
        }
    });

    return io;
};