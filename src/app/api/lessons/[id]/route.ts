// src/app/api/lessons/[id]/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

interface RouteParams {
    params: { id: string };
}

export async function GET(req: Request, { params }: RouteParams) {
    try {
        const user = await verifyToken();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const lesson = await prisma.lesson.findUnique({
            where: {
                id: params.id
            },
            include: {
                ward: true,
                teacher: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                    }
                },
                slides: {
                    include: {
                        resources: true
                    },
                    orderBy: {
                        order: 'asc'
                    }
                },
                class: {
                    include: {
                        ward: true
                    }
                }
            }
        });

        if (!lesson) {
            return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
        }

        return NextResponse.json(lesson);
    } catch (error) {
        console.error('Error fetching lesson:', error);
        return NextResponse.json(
            { error: 'Failed to load lesson', details: error instanceof Error ? error.message : 'Unknown error' },
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

        const data = await req.json();
        const lesson = await prisma.lesson.update({
            where: { id: params.id },
            data,
            include: {
                ward: true,
                teacher: true,
                slides: {
                    include: { resources: true },
                    orderBy: { order: 'asc' }
                }
            }
        });

        return NextResponse.json(lesson);
    } catch (error) {
        console.error('Error updating lesson:', error);
        return NextResponse.json(
            { error: 'Failed to update lesson' },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request, { params }: RouteParams) {
    try {
        const user = await verifyToken();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await prisma.lesson.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting lesson:', error);
        return NextResponse.json(
            { error: 'Failed to delete lesson' },
            { status: 500 }
        );
    }
}