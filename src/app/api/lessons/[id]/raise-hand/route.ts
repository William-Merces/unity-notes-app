// src/app/api/lessons/[id]/raise-hand/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const handRaise = await prisma.handRaise.create({
            data: {
                lessonId: params.id,
                userId: request.headers.get('user-id') || '',
            }
        });

        return NextResponse.json({ success: true, handRaise });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to raise hand' }, { status: 500 });
    }
}
