// src/app/api/ws/route.ts

import { WebSocketServer, WebSocket } from 'ws';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import type { IncomingMessage } from 'http';

interface LessonSocket extends WebSocket {
    userId?: string;
    lessonId?: string;
}

interface WSMessage {
    type: 'SLIDE_CHANGE' | 'HAND_RAISE' | 'POLL_VOTE';
    slide?: number;
    pollId?: string;
    option?: string;
}

const wss = new WebSocketServer({ noServer: true });
const lessonRooms = new Map<string, Set<LessonSocket>>();

wss.on('connection', async (ws: LessonSocket, request: IncomingMessage) => {
    try {
        const token = request.headers.cookie?.split('token=')[1];
        const user = await verifyToken(token);

        if (!user) {
            ws.close();
            return;
        }

        const lessonId = request.url?.split('/').pop();
        
        if (!lessonId) {
            ws.close();
            return;
        }

        ws.userId = user.id;
        ws.lessonId = lessonId;

        if (!lessonRooms.has(lessonId)) {
            lessonRooms.set(lessonId, new Set());
        }

        const room = lessonRooms.get(lessonId);
        room?.add(ws);

        // Create attendance record
        await prisma.attendance.create({
            data: {
                userId: user.id,
                lessonId
            }
        });

        ws.addListener('message', async (message: Buffer) => {
            try {
                const data = JSON.parse(message.toString()) as WSMessage;

                switch (data.type) {
                    case 'SLIDE_CHANGE':
                        if (typeof data.slide === 'number') {
                            await prisma.lesson.update({
                                where: { id: lessonId },
                                data: { currentSlide: data.slide }
                            });
                        }
                        break;

                    case 'HAND_RAISE':
                        await prisma.handRaise.create({
                            data: {
                                userId: user.id,
                                lessonId
                            }
                        });
                        break;

                    case 'POLL_VOTE':
                        if (data.pollId && data.option) {
                            await prisma.vote.create({
                                data: {
                                    userId: user.id,
                                    resourceId: data.pollId,
                                    option: data.option
                                }
                            });
                        }
                        break;
                }

                // Broadcast to all clients in room
                room?.forEach(client => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(data));
                    }
                });
            } catch (error) {
                console.error('Error processing message:', error);
            }
        });

        ws.addListener('close', async () => {
            room?.delete(ws);
            
            // Update attendance record
            await prisma.attendance.updateMany({
                where: {
                    userId: user.id,
                    lessonId,
                    leftAt: null
                },
                data: {
                    leftAt: new Date()
                }
            });
        });
    } catch (error) {
        console.error('WebSocket connection error:', error);
        ws.close();
    }
});

export default wss;