// src/lib/api/classes.ts

import { Class, Lesson, Ward } from '@/types/lesson';

// Interfaces para dados brutos
interface RawWard {
    id: string;
    name: string;
    stakeId: string;
    stake?: {
        id: string;
        name: string;
        createdAt: string;
        updatedAt: string;
    };
    createdAt: string;
    updatedAt: string;
}

interface RawClassData {
    id: string;
    name: string;
    wardId: string;
    ward: RawWard;
    organization?: string;
    createdAt: string;
    updatedAt: string;
    lessons?: Array<{
        id: string;
        title: string;
        isActive: boolean;
        firstHymn?: string;
        firstPrayer?: string;
        announcements?: string;
        lastHymn?: string;
        lastPrayer?: string;
        discourse?: string;
        currentSlide?: number;
        teacherId?: string;
        createdAt: string;
        updatedAt: string;
    }>;
    _count?: {
        enrollments: number;
    };
}

// Função para converter string de data em objeto Date
function parseDate(dateString: string): Date {
    return new Date(dateString);
}

// Função para processar Ward raw em Ward tipado
function processWard(rawWard: RawWard): Ward {
    return {
        id: rawWard.id,
        name: rawWard.name,
        stakeId: rawWard.stakeId,
        stake: rawWard.stake ? {
            id: rawWard.stake.id,
            name: rawWard.stake.name,
            wards: [], // Será preenchido quando necessário
            createdAt: parseDate(rawWard.stake.createdAt),
            updatedAt: parseDate(rawWard.stake.updatedAt)
        } : undefined,
        createdAt: parseDate(rawWard.createdAt),
        updatedAt: parseDate(rawWard.updatedAt)
    };
}

export async function getEnrolledClasses(): Promise<Class[]> {
    try {
        // Configuração da requisição
        const requestConfig: RequestInit = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            cache: 'no-store',
            next: { revalidate: 0 }
        };

        // URL base com fallback
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || window.location.origin;
        const response = await fetch(`${baseUrl}/api/classes/enrolled`, requestConfig);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            console.error('Received invalid data format:', data);
            throw new Error('Invalid data format received from server');
        }

        const processedClasses = data.map((rawClass: RawClassData): Class => {
            try {
                // Ordenar lições por data de criação
                const lessons: Lesson[] = Array.isArray(rawClass.lessons)
                    ? rawClass.lessons
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map(lesson => ({
                            ...lesson,
                            wardId: rawClass.wardId,
                            classId: rawClass.id,
                            slides: [],
                            name: lesson.title,
                            createdAt: parseDate(lesson.createdAt),
                            updatedAt: parseDate(lesson.updatedAt),
                            firstHymn: lesson.firstHymn || '',
                            firstPrayer: lesson.firstPrayer || '',
                            announcements: lesson.announcements || '',
                            lastHymn: lesson.lastHymn || '',
                            lastPrayer: lesson.lastPrayer || '',
                            discourse: lesson.discourse || '',
                            currentSlide: lesson.currentSlide || 0,
                            teacherId: lesson.teacherId || ''
                        }))
                    : [];

                // Encontrar aula atual e próxima
                const currentLesson = lessons.find(l => l.isActive) || null;
                const nextLesson = lessons
                    .filter(l => !l.isActive)
                    .sort((a, b) =>
                        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                    )[0] || null;

                // Processar ward com valores seguros
                const processedWard: Ward = rawClass.ward ? processWard(rawClass.ward) : {
                    id: '',
                    name: '',
                    stakeId: '',
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                return {
                    id: rawClass.id,
                    name: rawClass.name,
                    wardId: rawClass.wardId,
                    ward: processedWard,
                    organization: rawClass.organization || '',
                    lessons,
                    currentLesson,
                    nextLesson,
                    _count: {
                        enrollments: rawClass._count?.enrollments || 0
                    },
                    createdAt: parseDate(rawClass.createdAt),
                    updatedAt: parseDate(rawClass.updatedAt)
                };
            } catch (processError) {
                console.error('Error processing class:', rawClass.id, processError);
                // Retorna objeto Class seguro em caso de erro
                return {
                    id: rawClass.id || 'error',
                    name: 'Error loading class',
                    wardId: '',
                    ward: {
                        id: '',
                        name: '',
                        stakeId: '',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    },
                    organization: '',
                    lessons: [],
                    currentLesson: null,
                    nextLesson: null,
                    _count: { enrollments: 0 },
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
            }
        });

        return processedClasses;
    } catch (error) {
        console.error('Error fetching enrolled classes:', error);
        if (error instanceof Error) {
            console.error('Stack trace:', error.stack);
        }
        return []; // Retorna array vazio em caso de erro
    }
}