// src/app/api/lessons/[id]/lower-hand/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const handRaise = await prisma.handRaise.updateMany({
            where: {
                lessonId: params.id,
                userId: request.headers.get('user-id') || '',
                resolved: false
            },
            data: { resolved: true }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to lower hand' }, { status: 500 });
    }
}