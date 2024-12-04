// src/app/api/user/update/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function PUT(request: Request) {
    try {
        const token = cookies().get('token')?.value;
        const user = await verifyToken(token);
        
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        let wardId: string | null = null;

        // Verificar se o usuário existe
        const existingUser = await prisma.user.findUnique({
            where: { id: user.id }
        });

        if (!existingUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Lidar com estaca existente ou nova
        let stakeId = body.stake;
        if (body.newStake) {
            const stake = await prisma.stake.create({
                data: { name: body.newStake }
            });
            stakeId = stake.id;
        }

        // Lidar com ala existente ou nova
        if (body.newWard && stakeId) {
            const ward = await prisma.ward.create({
                data: {
                    name: body.newWard,
                    stakeId: stakeId
                }
            });
            wardId = ward.id;
        } else if (body.ward) {
            wardId = body.ward;
        }

        // Atualizar usuário
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                wardId,
                organization: body.organization
            },
            include: {
                ward: {
                    include: {
                        stake: true
                    }
                }
            }
        });

        const { password: _, ...userWithoutPassword } = updatedUser;
        return NextResponse.json({ user: userWithoutPassword });
    } catch (error) {
        console.error('Update profile error:', error);
        
        if (error instanceof Error) {
            return NextResponse.json({ 
                error: error.message 
            }, { status: 400 });
        }

        return NextResponse.json({ 
            error: 'Failed to update profile'
        }, { status: 500 });
    }
}