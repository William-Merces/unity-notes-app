import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log('Dados recebidos:', JSON.stringify(body, null, 2));

        const teacherId = await getOrCreateTeacherId();

        const lesson = await prisma.lesson.create({
            data: {
                title: body.title || "Nova Aula",
                firstHymn: body.firstHymn,
                firstPrayer: body.firstPrayer,
                announcements: body.announcements,
                lastHymn: body.lastHymn,
                lastPrayer: body.lastPrayer,
                discourse: body.discourse,
                teacherId: teacherId,
                slides: {
                    create: body.slides.map((slide: any, index: number) => ({
                        order: index,
                        content: slide.content,
                        resources: {
                            create: slide.resources.map((resource: any) => ({
                                type: resource.type,
                                content: resource.content || resource.question || '',
                                reference: resource.reference || null,
                                options: resource.type === 'poll' 
                                    ? JSON.stringify({ options: resource.options })
                                    : resource.type === 'question'
                                        ? JSON.stringify({ suggestions: resource.suggestions })
                                        : null
                            }))
                        }
                    }))
                }
            },
            include: {
                slides: {
                    include: {
                        resources: true
                    }
                }
            }
        });

        return NextResponse.json(lesson);
    } catch (error) {
        console.error('Erro ao criar aula:', error);
        return NextResponse.json(
            { error: 'Erro ao criar aula: ' + (error instanceof Error ? error.message : String(error)) },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const lessons = await prisma.lesson.findMany({
            include: {
                slides: {
                    include: {
                        resources: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(lessons);
    } catch (error) {
        console.error('Erro ao buscar aulas:', error);
        return NextResponse.json(
            { error: 'Erro ao buscar aulas' },
            { status: 500 }
        );
    }
}

async function getOrCreateTeacherId(): Promise<string> {
    const existingTeacher = await prisma.user.findFirst({
        where: {
            role: 'TEACHER'
        }
    });

    if (existingTeacher) {
        return existingTeacher.id;
    }

    const newTeacher = await prisma.user.create({
        data: {
            name: "Professor Teste",
            email: "professor@teste.com",
            role: "TEACHER"
        }
    });

    return newTeacher.id;
}