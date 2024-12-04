// src/app/api/lessons/raise-hand/route.ts

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

        const handRaise = await prisma.handRaise.create({
            data: {
                userId: user.id,
                lessonId,
                resolved: false
            },
            include: {
                user: true
            }
        });

        await pusherServer.trigger(`lesson-${lessonId}`, 'hand-raise', {
            handRaise: {
                userId: handRaise.userId,
                userName: handRaise.user.name,
                timestamp: handRaise.timestamp,
                resolved: handRaise.resolved
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error raising hand:', error);
        return NextResponse.json({ error: 'Failed to raise hand' }, { status: 500 });
    }
}