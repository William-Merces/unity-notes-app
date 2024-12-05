// src/app/api/lessons/[id]/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
    params: {
        id: string;
    };
}

export async function GET(req: Request, { params }: RouteParams) {
    try {
        const lesson = await prisma.lesson.findUnique({
            where: {
                id: params.id
            },
            include: {
                slides: {
                    include: {
                        resources: true
                    },
                    orderBy: {
                        order: 'asc'
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