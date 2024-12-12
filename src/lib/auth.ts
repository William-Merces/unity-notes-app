// src/lib/auth.ts

import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { User } from '@/types/user';

export async function verifyToken(token?: string): Promise<User | null> {
    try {
        // Primeiro tenta usar o token passado
        let tokenToVerify = token;

        // Se não foi passado token, tenta pegar dos cookies
        if (!tokenToVerify) {
            const cookieStore = cookies();
            tokenToVerify = cookieStore.get('token')?.value;
        }

        // Se ainda não temos token, retorna null
        if (!tokenToVerify) {
            console.debug('No token found');
            return null;
        }

        // Verifica o JWT
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error('JWT_SECRET not configured');
            return null;
        }

        try {
            const { payload } = await jwtVerify(
                tokenToVerify,
                new TextEncoder().encode(secret)
            );

            if (!payload.userId) {
                console.debug('No userId in token payload');
                return null;
            }

            // Busca o usuário no banco
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

            if (!user) {
                console.debug('User not found in database');
                return null;
            }

            // Remove a senha antes de retornar
            const { password: _, ...userWithoutPassword } = user as { [key: string]: any };

            // Valida se todos os campos obrigatórios existem
            const requiredFields = ['id', 'name', 'email', 'role'];
            const missingFields = requiredFields.filter(field => !userWithoutPassword[field]);

            if (missingFields.length > 0) {
                console.error('Missing required user fields:', missingFields);
                return null;
            }

            return userWithoutPassword as User;

        } catch (jwtError) {
            if (jwtError instanceof Error) {
                console.error('JWT verification failed:', jwtError.message);
                // Se for erro de token expirado, poderia implementar refresh token aqui
                if (jwtError.message.includes('expired')) {
                    // TODO: Implementar refresh token
                }
            }
            return null;
        }

    } catch (error) {
        // Log do erro completo em desenvolvimento
        if (process.env.NODE_ENV === 'development') {
            console.error('Token verification error:', error);
            if (error instanceof Error) {
                console.error('Stack trace:', error.stack);
            }
        } else {
            // Log mais sucinto em produção
            console.error('Authentication error:', error instanceof Error ? error.message : 'Unknown error');
        }
        return null;
    }
}

// Função auxiliar para verificar papel do usuário
export function checkUserRole(user: User | null, allowedRoles: string[]): boolean {
    if (!user) return false;
    return allowedRoles.includes(user.role);
}

// Função auxiliar para verificar se o usuário pertence a uma ala
export function checkUserWard(user: User | null, wardId: string): boolean {
    if (!user || !user.ward) return false;
    return user.ward.id === wardId;
}

// Função auxiliar para verificar se o usuário pertence a uma estaca
export function checkUserStake(user: User | null, stakeId: string): boolean {
    if (!user?.ward?.stake) return false;
    return user.ward.stake.id === stakeId;
}

export type AuthenticatedUser = NonNullable<Awaited<ReturnType<typeof verifyToken>>>;

// Type guard para verificar se o usuário está autenticado
export function isAuthenticated(user: User | null): user is AuthenticatedUser {
    return user !== null;
}