// src/app/api/lessons/join/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pusherServer } from '@/lib/pusher';
import { verifyToken } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const user = await verifyToken();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        const { lessonId } = data;

        // Registra a presença
        await prisma.attendance.create({
            data: {
                userId: user.id,
                lessonId,
                isGuest: !user.ward
            }
        });

        // Busca todos os participantes atuais
        const participants = await prisma.attendance.findMany({
            where: {
                lessonId,
                leftAt: null
            },
            include: {
                user: true
            }
        });

        // Envia atualização via Pusher
        await pusherServer.trigger(`lesson-${lessonId}`, 'participants-update', {
            participants: participants.map(p => ({
                userId: p.userId,
                userName: p.user.name,
                isGuest: p.isGuest,
                joinedAt: p.joinedAt
            }))
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error joining lesson:', error);
        return NextResponse.json({ error: 'Failed to join lesson' }, { status: 500 });
    }
}