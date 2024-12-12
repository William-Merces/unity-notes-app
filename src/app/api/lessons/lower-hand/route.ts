// src/app/api/lessons/lower-hand/route.ts

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

        await prisma.handRaise.updateMany({
            where: {
                userId: user.id,
                lessonId,
                resolved: false
            },
            data: {
                resolved: true
            }
        });

        await pusherServer.trigger(`lesson-${lessonId}`, 'hand-lower', {
            userId: user.id
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error lowering hand:', error);
        return NextResponse.json({ error: 'Failed to lower hand' }, { status: 500 });
    }
}