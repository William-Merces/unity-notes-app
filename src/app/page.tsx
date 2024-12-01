'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card/card';
import { Button } from '@/components/ui/button/button';
import { Skeleton } from '@/components/ui/skeleton/skeleton';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PlusCircle, ChevronRight, BookOpen, User2, Calendar, Check } from 'lucide-react';

interface Lesson {
    id: string;
    title: string;
    firstHymn: string;
    firstPrayer: string;
    announcements?: string;
    lastHymn: string;
    lastPrayer: string;
    discourse: string;
    createdAt: Date;
    slides: any[];
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
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <main className="min-h-screen p-4">
                <div className="max-w-4xl mx-auto">
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-48" />
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen p-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold">Minhas Aulas</h1>
                    <Link href="/criar-aula">
                        <Button>
                            <PlusCircle className="w-4 h-4 mr-2" />
                            Nova Aula
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-4">
                    {lessons.map((lesson) => (
                        <Link key={lesson.id} href={`/ver-aula?id=${lesson.id}`}>
                            <Card className="hover:bg-accent transition-colors">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Nova Aula</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center text-sm text-muted-foreground space-x-4">
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 mr-1" />
                                            {format(new Date(lesson.createdAt), "d 'de' MMMM", { locale: ptBR })}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}

                    {lessons.length === 0 && (
                        <Card className="p-8 flex flex-col items-center justify-center text-center">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                <BookOpen className="w-6 h-6 text-primary" />
                            </div>
                            <h2 className="font-semibold mb-2">Nenhuma aula preparada</h2>
                            <p className="text-sm text-muted-foreground mb-4">Comece criando sua primeira aula</p>
                            <Link href="/criar-aula">
                                <Button>
                                    <PlusCircle className="w-4 h-4 mr-2" />
                                    Criar Aula
                                </Button>
                            </Link>
                        </Card>
                    )}
                </div>
            </div>
        </main>
    );
}