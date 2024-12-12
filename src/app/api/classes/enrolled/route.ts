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
                ward: {
                    include: {
                        stake: true
                    }
                },
                _count: {
                    select: {
                        enrollments: true
                    }
                },
                lessons: {
                    where: {
                        OR: [
                            { isActive: true },
                            { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
                        ]
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    include: {
                        teacher: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });

        return NextResponse.json(enrolledClasses);
    } catch (error) {
        console.error('Error in GET /api/classes/enrolled:', error);
        return NextResponse.json(
            { error: 'Failed to fetch enrolled classes' },
            { status: 500 }
        );
    }
}