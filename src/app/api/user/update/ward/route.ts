// src/app/api/user/update/ward/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const user = await verifyToken();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { wardId } = await request.json();
        if (!wardId) {
            return NextResponse.json(
                { error: 'ID da ala é obrigatório' },
                { status: 400 }
            );
        }

        // Verifica se a ala existe
        const ward = await prisma.ward.findUnique({
            where: { id: wardId },
            include: { stake: true }
        });

        if (!ward) {
            return NextResponse.json(
                { error: 'Ala não encontrada' },
                { status: 404 }
            );
        }

        // Atualiza o usuário
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { 
                wardId,
                // Reseta a organização quando muda de ala
                organization: null
            },
            include: { 
                ward: {
                    include: {
                        stake: true
                    }
                }
            }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Error updating user ward:', error);
        return NextResponse.json(
            { error: 'Erro ao atualizar ala do usuário' },
            { status: 500 }
        );
    }
}