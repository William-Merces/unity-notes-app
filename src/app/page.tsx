'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card/card';
import { Skeleton } from '@/components/ui/skeleton/skeleton';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import { ptBR } from 'date-fns/locale';
import { PlusCircle, ChevronRight, BookOpen, User2, Calendar, Check } from 'lucide-react';

interface Lesson {
    id: string;
    title: string;
    createdAt: string;
    teacher?: {
        name: string;
    };
    isActive: boolean;
}

export default function Home() {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/lessons')
            .then(res => res.json())
            .then(data => {
                if (!data.error) {
                    setLessons(data);
                }
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
                <div className="container max-w-4xl px-4 py-6 mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="mb-4">
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-4 w-1/3" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            <div className="container max-w-4xl px-4 py-6 mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Minhas Aulas</h1>
                        <p className="text-muted-foreground mt-1">
                            {lessons.length} {lessons.length === 1 ? 'aula preparada' : 'aulas preparadas'}
                        </p>
                    </div>
                    <Link href="/criar-aula" className="w-full sm:w-auto">
                        <Button className="w-full sm:w-auto gap-2" size="lg">
                            <PlusCircle className="h-5 w-5" />
                            Nova Aula
                        </Button>
                    </Link>
                </div>

                <div className="space-y-4">
                    {lessons.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Nenhuma aula encontrada</h3>
                                <p className="text-muted-foreground mb-4 max-w-sm">
                                    Comece criando sua primeira aula. É fácil e rápido!
                                </p>
                                <Link href="/criar-aula">
                                    <Button variant="outline" className="gap-2">
                                        <PlusCircle className="h-4 w-4" />
                                        Criar Primeira Aula
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        lessons.map(lesson => (
                            <Card
                                key={lesson.id}
                                className={`transition-all hover:shadow-md ${lesson.isActive ? 'border-primary/50' : ''}`}
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <CardTitle className="flex items-center gap-2">
                                                {lesson.title}
                                                {lesson.isActive && (
                                                    <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                                                        <Check className="h-3 w-3" />
                                                        Ativa
                                                    </span>
                                                )}
                                            </CardTitle>
                                            {lesson.teacher && (
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                    <User2 className="h-3 w-3 mr-1" />
                                                    {lesson.teacher.name}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 self-start sm:self-center">
                                            <div className="flex items-center text-xs text-muted-foreground">
                                                <Calendar className="h-3 w-3 mr-1" />
                                                {formatDistanceToNow(new Date(lesson.createdAt), {
                                                    addSuffix: true,
                                                    locale: ptBR
                                                })}
                                            </div>
                                            <Link href={`/ver-aula?id=${lesson.id}`}>
                                                <Button variant="outline" className="gap-2">
                                                    Abrir Aula
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}