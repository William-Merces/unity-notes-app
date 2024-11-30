import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Primeiro vamos verificar se o usuário já existe
        const existingUser = await prisma.user.findUnique({
            where: {
                email: "professor@teste.com"
            }
        });

        if (existingUser) {
            return NextResponse.json({
                message: "Usuário professor já existe",
                id: existingUser.id
            });
        }

        // Se não existe, vamos criar
        const user = await prisma.user.create({
            data: {
                name: "Professor Teste",
                email: "professor@teste.com",
                role: "TEACHER"
            }
        });

        return NextResponse.json({
            message: "Usuário professor criado com sucesso",
            id: user.id
        });
    } catch (error) {
        console.error('Erro ao criar usuário de teste:', error);
        return NextResponse.json(
            { error: 'Erro ao criar usuário de teste' },
            { status: 500 }
        );
    }
}