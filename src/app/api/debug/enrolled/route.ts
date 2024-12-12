// src/app/api/debug/enrolled/route.ts
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const user = await verifyToken();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verificar matrículas do usuário
        const enrollments = await prisma.enrollment.findMany({
            where: {
                userId: user.id,
                status: 'ACTIVE'
            },
            include: {
                class: true
            }
        });
        console.log('User enrollments:', enrollments);

        // Verificar aulas por classe
        const classesWithLessons = await Promise.all(
            enrollments.map(async (enrollment) => {
                const lessons = await prisma.lesson.findMany({
                    where: {
                        classId: enrollment.classId,
                        isActive: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1
                });
                return {
                    classId: enrollment.classId,
                    className: enrollment.class.name,
                    lessons
                };
            })
        );

        // Retorna diagnóstico completo
        return NextResponse.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            },
            enrollments: enrollments.map(e => ({
                id: e.id,
                status: e.status,
                class: {
                    id: e.class.id,
                    name: e.class.name
                }
            })),
            classesWithLessons,
            raw: {
                enrollments,
            }
        });
    } catch (error) {
        console.error('Debug route error:', error);
        return NextResponse.json({ error: 'Debug failed', details: error }, { status: 500 });
    }
}