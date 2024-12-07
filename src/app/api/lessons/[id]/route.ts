// src/app/api/lessons/[id]/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

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

export async function DELETE(req: Request, { params }: RouteParams) {
    try {
        const lesson = await prisma.lesson.delete({
            where: {
                id: params.id
            }
        });

        return NextResponse.json(lesson);
    } catch (error) {
        console.error('Erro ao excluir aula:', error);
        return NextResponse.json(
            { error: 'Erro ao excluir aula' },
            { status: 500 }
        );
    }
}

export async function PUT(req: Request, { params }: RouteParams) {
    try {
        const user = await verifyToken();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const {
            title,
            firstHymn,
            firstPrayer,
            announcements,
            lastHymn,
            lastPrayer,
            discourse,
            wardId,
            classId,
            teacherId,
            slides
        } = await req.json();

        const updatedLesson = await prisma.lesson.update({
            where: { id },
            data: {
                title,
                firstHymn,
                firstPrayer,
                announcements,
                lastHymn,
                lastPrayer,
                discourse,
                wardId,
                classId,
                teacherId,
                slides: {
                    deleteMany: {},
                    create: slides.map((slide: { content: string, resources: { type: string, content?: string, reference?: string, options?: string }[] }, index: number) => ({
                        content: slide.content,
                        order: index,
                        resources: {
                            create: slide.resources.map(resource => ({
                                type: resource.type,
                                content: resource.content || null,
                                reference: resource.reference || null,
                                options: resource.options || null
                            }))
                        }
                    }))
                }
            }
        });

        return NextResponse.json(updatedLesson);
    } catch (error) {
        console.error('Erro ao atualizar aula:', error);
        return NextResponse.json(
            { error: 'Erro ao atualizar aula' },
            { status: 500 }
        );
    }
}