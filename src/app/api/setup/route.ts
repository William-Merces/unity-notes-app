// src/app/api/setup/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        // Primeiro vamos verificar se o usuário já existe
        const existingUser = await prisma.user.findFirst({
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

        // Criar uma senha padrão e criptografá-la
        const password = "123456"; // senha padrão para teste
        const hashedPassword = await bcrypt.hash(password, 10);

        // Se não existe, vamos criar
        const user = await prisma.user.create({
            data: {
                name: "Professor Teste",
                email: "professor@teste.com",
                password: hashedPassword, // Adicionando o campo password
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