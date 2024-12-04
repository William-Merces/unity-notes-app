// src/app/lessons/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card/card';
import { Button } from '@/components/ui/button/button';
import { Edit, Trash2, Play, Users } from 'lucide-react';
import { format } from 'date-fns';

interface Lesson {
    id: string;
    title: string;
    createdAt: Date;
    isActive: boolean;
    ward: {
        name: string;
    };
    teacherId: string;
    _count: {
        attendance: number;
    };
}

export default function LessonsPage() {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const router = useRouter();
    const { user } = useAuth();

    useEffect(() => {
        fetchLessons();
    }, []);

    const fetchLessons = async () => {
        const res = await fetch('/api/lessons');
        if (res.ok) {
            const data = await res.json();
            setLessons(data);
        }
    };

    const deleteLesson = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta aula?')) return;

        const res = await fetch(`/api/lessons/${id}`, {
            method: 'DELETE',
        });

        if (res.ok) {
            fetchLessons();
        }
    };

    const startLesson = async (id: string) => {
        const res = await fetch(`/api/lessons/${id}/start`, {
            method: 'POST',
        });

        if (res.ok) {
            router.push(`/ver-aula?id=${id}`);
        }
    };

    // Verificação de usuário sem ala
    if (!user?.ward) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card>
                    <CardContent className="p-6 text-center">
                        <h2 className="text-lg font-semibold mb-4">Usuário não vinculado a nenhuma ala</h2>
                        <p className="mb-4">Para criar ou visualizar aulas, você precisa estar vinculado a uma ala.</p>
                        <Button 
                            onClick={() => router.push('/profile/update')}
                        >
                            Atualizar Cadastro
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Minhas Aulas</h1>
                <Button onClick={() => router.push('/criar-aula')}>
                    Nova Aula
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {lessons.map((lesson) => (
                    <Card key={lesson.id} className="flex flex-col">
                        <CardHeader>
                            <CardTitle>{lesson.title}</CardTitle>
                            <CardDescription>
                                {lesson.ward.name} • {format(new Date(lesson.createdAt), 'dd/MM/yyyy')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Users className="h-4 w-4" />
                                <span>{lesson._count.attendance} participantes</span>
                            </div>
                        </CardContent>
                        <CardFooter className="mt-auto">
                            <div className="flex gap-2 w-full">
                                <Button variant="outline" size="sm" onClick={() => router.push(`/editar-aula/${lesson.id}`)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Editar
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => deleteLesson(lesson.id)}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Excluir
                                </Button>
                                {!lesson.isActive && (
                                    <Button size="sm" className="ml-auto" onClick={() => startLesson(lesson.id)}>
                                        <Play className="h-4 w-4 mr-2" />
                                        Iniciar
                                    </Button>
                                )}
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}