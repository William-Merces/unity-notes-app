// src/app/api/lessons/[id]/end/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const [lesson, attendance] = await prisma.$transaction([
            prisma.lesson.update({
                where: { id: params.id },
                data: { isActive: false }
            }),
            prisma.attendance.updateMany({
                where: {
                    lessonId: params.id,
                    leftAt: null
                },
                data: { leftAt: new Date() }
            })
        ]);

        return NextResponse.json({ success: true, lesson });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to end lesson' }, { status: 500 });
    }
}