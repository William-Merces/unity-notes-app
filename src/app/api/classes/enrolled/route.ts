// src/app/api/classes/enrolled/route.ts

import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const user = await verifyToken();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const enrolledClasses = await prisma.class.findMany({
            where: {
                enrollments: {
                    some: {
                        userId: user.id,
                        status: 'ACTIVE'
                    }
                }
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

        return NextResponse.json(enrolledClasses);
    } catch (error) {
        console.error('Error fetching enrolled classes:', error);
        return NextResponse.json(
            { error: 'Failed to fetch enrolled classes' },
            { status: 500 }
        );
    }
}