// src/app/api/auth/me/route.ts

import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET() {
    try {
        const user = await verifyToken();
        if (!user) {
            return NextResponse.json({ user: null }, { status: 401 });
        }

        const { password: _, ...userWithoutPassword } = user;
        return NextResponse.json({ user: userWithoutPassword });
    } catch (error) {
        console.error('ME route error:', error);
        return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }
}