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
        const { lessonId, pollId, option } = data;

        await prisma.vote.create({
            data: {
                userId: user.id,
                resourceId: pollId,
                option
            }
        });

        // Busca resultados atualizados
        const results = await prisma.vote.groupBy({
            by: ['option'],
            where: {
                resourceId: pollId
            },
            _count: true
        });

        const pollResults = results.reduce((acc, curr) => {
            acc[curr.option] = curr._count;
            return acc;
        }, {} as Record<string, number>);

        await pusherServer.trigger(`lesson-${lessonId}`, 'poll-update', {
            pollId,
            results: pollResults
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error voting in poll:', error);
        return NextResponse.json({ error: 'Failed to vote in poll' }, { status: 500 });
    }
}