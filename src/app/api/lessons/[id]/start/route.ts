// src/app/api/lessons/[id]/start/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const lesson = await prisma.lesson.update({
            where: { id: params.id },
            data: { isActive: true }
        });

        return NextResponse.json({ success: true, lesson });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to start lesson' }, { status: 500 });
    }
}
