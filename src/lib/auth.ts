// src/lib/auth.ts

import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function verifyToken(token?: string) {
    try {
        if (!token) {
            const cookieStore = cookies();
            token = cookieStore.get('token')?.value;
        }

        if (!token) return null;

        const { payload } = await jwtVerify(
            token,
            new TextEncoder().encode(process.env.JWT_SECRET)
        );

        if (!payload.userId) return null;

        const user = await prisma.user.findUnique({
            where: { id: payload.userId as string },
            include: { 
                ward: {
                    include: {
                        stake: true
                    }
                }
            }
        });

        return user;
    } catch (error) {
        console.error('Token verification error:', error);
        return null;
    }
}