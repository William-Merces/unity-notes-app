import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const lesson = await prisma.lesson.findUnique({
            where: {
                id: params.id
            },
            include: {
                slides: {
                    include: {
                        resources: true
                    }
                }
            }
        });

        if (!lesson) {
            return NextResponse.json(
                { error: 'Aula não encontrada' },
                { status: 404 }
            );
        }

        return NextResponse.json(lesson);
    } catch (error) {
        console.error('Erro ao buscar aula:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar aula' },
            { status: 500 }
        );
    }
}