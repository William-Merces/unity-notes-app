// src/app/api/test-db/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Tenta uma operação simples no banco
        const count = await prisma.user.count();
        return NextResponse.json({ status: 'Database connection successful', userCount: count });
    } catch (error) {
        console.error('Database connection error:', error);
        return NextResponse.json(
            { error: 'Database connection failed', details: (error as Error).message },
            { status: 500 }
        );
    }
}