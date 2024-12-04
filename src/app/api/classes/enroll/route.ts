// src/app/api/classes/enroll/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const user = await verifyToken();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { classId } = await request.json();
        if (!classId) {
            return NextResponse.json(
                { error: 'ID da classe é obrigatório' },
                { status: 400 }
            );
        }

        // Verifica se a classe existe
        const classExists = await prisma.class.findUnique({
            where: { id: classId }
        });

        if (!classExists) {
            return NextResponse.json(
                { error: 'Classe não encontrada' },
                { status: 404 }
            );
        }

        // Verifica se já existe matrícula
        const existingEnrollment = await prisma.enrollment.findFirst({
            where: {
                userId: user.id,
                classId: classId
            }
        });

        if (existingEnrollment) {
            return NextResponse.json(
                { error: 'Usuário já está matriculado nesta classe' },
                { status: 400 }
            );
        }

        const enrollment = await prisma.enrollment.create({
            data: {
                userId: user.id,
                classId,
                status: 'ACTIVE'
            },
            include: {
                class: {
                    include: {
                        ward: true,
                        _count: {
                            select: {
                                enrollments: true
                            }
                        }
                    }
                }
            }
        });

        return NextResponse.json(enrollment);
    } catch (error) {
        console.error('Error enrolling in class:', error);
        return NextResponse.json(
            { error: 'Erro ao realizar matrícula' },
            { status: 500 }
        );
    }
}