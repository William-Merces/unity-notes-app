// src/app/api/stakes/[stakeId]/wards/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function POST(
    request: Request,
    { params }: { params: { stakeId: string } }
) {
    try {
        const user = await verifyToken();
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name } = await request.json();
        if (!name) {
            return NextResponse.json(
                { error: 'Nome da ala é obrigatório' },
                { status: 400 }
            );
        }

        const ward = await prisma.ward.create({
            data: {
                name,
                stakeId: params.stakeId,
                // Cria automaticamente as classes padrão
                classes: {
                    create: [
                        {
                            name: `Quórum de Élderes - ${name}`,
                            organization: 'elders'
                        },
                        {
                            name: `Sociedade de Socorro - ${name}`,
                            organization: 'relief_society'
                        }
                    ]
                }
            },
            include: {
                classes: true
            }
        });

        return NextResponse.json(ward);
    } catch (error) {
        console.error('Error creating ward:', error);
        return NextResponse.json(
            { error: 'Erro ao criar ala' },
            { status: 500 }
        );
    }
}