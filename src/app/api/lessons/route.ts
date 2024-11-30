import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const lessonData: Prisma.LessonCreateInput = {
            title: "Nova Aula",
            firstHymn: body.firstHymn,
            firstPrayer: body.firstPrayer,
            announcements: body.announcements || null,
            lastHymn: body.lastHymn,
            lastPrayer: body.lastPrayer,
            discourse: body.discourse,
            discoursePath: '',
            teacher: {
                connect: {
                    id: "cm437iq2m0000ttpwvv6xbnpx" // ID do professor de teste
                }
            },
            slides: {
                create: body.slides.map((slide: any, index: number) => ({
                    order: index,
                    content: slide.content,
                    resources: {
                        create: slide.resources?.map((resource: any) => ({
                            type: resource.type,
                            content: resource.content || resource.question || '',
                            reference: resource.reference || null,
                            options: resource.options
                                ? JSON.stringify(resource.options)
                                : null
                        }))
                    }
                }))
            }
        };

        const lesson = await prisma.lesson.create({
            data: lessonData,
            include: {
                teacher: true,
                slides: {
                    include: {
                        resources: true
                    }
                }
            }
        });

        return NextResponse.json(lesson);
    } catch (error) {
        console.error('Error creating lesson:', error);
        return NextResponse.json(
            { error: 'Error creating lesson' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const lessons = await prisma.lesson.findMany({
            include: {
                teacher: true,
                slides: {
                    include: {
                        resources: true
                    }
                }
            }
        });

        return NextResponse.json(lessons);
    } catch (error) {
        console.error('Error fetching lessons:', error);
        return NextResponse.json(
            { error: 'Error fetching lessons' },
            { status: 500 }
        );
    }
}