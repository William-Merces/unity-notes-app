// src/lib/socket.ts

import { Server } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import type { NextApiResponse } from 'next';
import { verifyToken } from './auth';
import { prisma } from './prisma';

export const initSocketServer = (server: HTTPServer) => {
    const io = new Server(server, {
        path: '/api/socketio',
        addTrailingSlash: false,
    });

    io.on('connection', async (socket) => {
        const token = socket.handshake.auth.token;
        const user = await verifyToken(token);

        if (!user) {
            socket.disconnect();
            return;
        }

        socket.on('join-lesson', async (lessonId) => {
            socket.join(`lesson:${lessonId}`);

            await prisma.attendance.create({
                data: {
                    userId: user.id,
                    lessonId
                }
            });

            socket.emit('lesson-joined', { lessonId });
        });

        socket.on('slide-change', async (data) => {
            const { lessonId, slideIndex } = data;

            await prisma.lesson.update({
                where: { id: lessonId },
                data: { currentSlide: slideIndex }
            });

            socket.to(`lesson:${lessonId}`).emit('slide-changed', { slideIndex });
        });

        socket.on('raise-hand', async (lessonId) => {
            const handRaise = await prisma.handRaise.create({
                data: {
                    userId: user.id,
                    lessonId
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
        });

        socket.on('vote', async (data) => {
            const { lessonId, pollId, option } = data;

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
        });

        socket.on('disconnecting', async () => {
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
        });
    });

    return io;
};