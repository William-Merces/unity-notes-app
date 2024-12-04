// src/app/api/stakes/route.ts

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const stakes = await prisma.stake.findMany({
            include: {
                wards: {
                    include: {
                        classes: {
                            include: {
                                _count: {
                                    select: {
                                        enrollments: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        return NextResponse.json(stakes);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch stakes' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const stake = await prisma.stake.create({
            data: {
                name: body.name,
                wards: {
                    create: body.wards ? body.wards.map((ward: string) => ({ name: ward })) : []
                }
            },
            include: {
                wards: true
            }
        });
        return NextResponse.json(stake);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create stake' }, { status: 500 });
    }
}