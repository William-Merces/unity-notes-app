// src/app/api/lessons/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET() {
    try {
        const user = await verifyToken();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const lessons = await prisma.lesson.findMany({
            where: {
                OR: [
                    { wardId: user.ward?.id },
                    { teacherId: user.id }
                ]
            },
            include: {
                ward: true,
                teacher: true,
                slides: true,
                _count: {
                    select: {
                        attendance: true
                    }
                },
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(lessons);
    } catch (error) {
        console.error('Error fetching lessons:', error);
        return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const user = await verifyToken();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!user.wardId) {
            return NextResponse.json(
                { error: 'Usuário não está associado a uma ala' },
                { status: 401 }
            );
        }

        const data = await request.json();

        if (!data.firstHymn || typeof data.firstHymn !== 'string') {
            return NextResponse.json({ error: 'Primeiro hino é obrigatório' }, { status: 400 });
        }
        if (!data.firstPrayer || typeof data.firstPrayer !== 'string') {
            return NextResponse.json({ error: 'Primeira oração é obrigatória' }, { status: 400 });
        }
        if (!data.lastHymn || typeof data.lastHymn !== 'string') {
            return NextResponse.json({ error: 'Último hino é obrigatório' }, { status: 400 });
        }
        if (!data.lastPrayer || typeof data.lastPrayer !== 'string') {
            return NextResponse.json({ error: 'Última oração é obrigatória' }, { status: 400 });
        }
        if (!data.discourse || typeof data.discourse !== 'string') {
            return NextResponse.json({ error: 'Discurso é obrigatório' }, { status: 400 });
        }
        if (!data.classId || typeof data.classId !== 'string') {
            return NextResponse.json({ error: 'ID da classe é obrigatório' }, { status: 400 });
        }
        if (!Array.isArray(data.slides) || data.slides.length === 0) {
            return NextResponse.json({ error: 'Slides são obrigatórios' }, { status: 400 });
        }

        const lesson = await prisma.lesson.create({
            data: {
                title: data.title || "Nova Aula",
                firstHymn: data.firstHymn,
                firstPrayer: data.firstPrayer,
                announcements: data.announcements || "",
                lastHymn: data.lastHymn,
                lastPrayer: data.lastPrayer,
                discourse: data.discourse,
                wardId: user.wardId,
                teacherId: user.id,
                classId: data.classId,
                slides: {
                    create: data.slides.map((slide: any, index: number) => ({
                        content: slide.content,
                        order: index,
                        resources: {
                            create: Array.isArray(slide.resources) ? slide.resources.map((resource: any) => ({
                                type: resource.type,
                                content: resource.content || null,
                                reference: resource.reference || null,
                                options: Array.isArray(resource.options) ? resource.options : null
                            })) : []
                        }
                    }))
                }
            },
            include: {
                ward: true,
                teacher: true,
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

        return NextResponse.json(lesson);
    } catch (error) {
        console.error('Error creating lesson:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Erro ao criar aula' },
            { status: 500 }
        );
    }
}
