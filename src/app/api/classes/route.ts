// src/app/api/classes/route.ts

import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const classes = await prisma.class.findMany({
            include: {
                ward: true,
                _count: {
                    select: {
                        enrollments: true
                    }
                }
            }
        });

        return NextResponse.json(classes);
    } catch (error) {
        console.error('Error fetching classes:', error);
        return NextResponse.json(
            { error: 'Failed to fetch classes' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const user = await verifyToken();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        const { name, wardId, organization } = data;

        const newClass = await prisma.class.create({
            data: {
                name,
                wardId,
                organization
            },
            include: {
                ward: true,
                _count: {
                    select: {
                        enrollments: true
                    }
                }
            }
        });

        return NextResponse.json(newClass);
    } catch (error) {
        console.error('Error creating class:', error);
        return NextResponse.json(
            { error: 'Failed to create class' },
            { status: 500 }
        );
    }
}