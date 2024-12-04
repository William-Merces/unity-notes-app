// src/app/api/auth/register/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { sign } from 'jsonwebtoken';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log('Received registration data:', {
            ...body,
            password: '[REDACTED]'
        });

        const hashedPassword = await bcrypt.hash(body.password, 10);

        // Define o papel do usuário
        const role = body.role || 'STUDENT'; // STUDENT, TEACHER ou ADMIN

        const userData = {
            name: body.name,
            email: body.email,
            password: hashedPassword,
            organization: body.organization,
            role: role,
        };

        console.log('Creating user with data:', {
            ...userData,
            password: '[REDACTED]'
        });

        const user = await prisma.user.create({
            data: userData,
            select: {
                id: true,
                name: true,
                email: true,
                organization: true,
                ward: true,
                role: true
            }
        });

        console.log('User created:', user);

        // Criar token JWT
        const token = sign(
            { userId: user.id },
            process.env.JWT_SECRET || 'fallback-secret-key',
            { expiresIn: '7d' }
        );

        // Define os cookies
        cookies().set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        });

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Registration error:', {
            error,
            message: (error as Error).message,
            stack: (error as Error).stack
        });
        
        return NextResponse.json(
            { error: 'Registration failed', details: (error as Error).message },
            { status: 500 }
        );
    }
}