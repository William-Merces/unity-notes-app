// src/app/ver-aula/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { RoomDisplay } from '@/components/room/RoomDisplay';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card/card';
import { LessonProvider } from '@/contexts/LessonContext';

export default function VerAula() {
    const [lesson, setLesson] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    useEffect(() => {
        if (!id) {
            setError('ID da aula não fornecido');
            setLoading(false);
            return;
        }

        const fetchLesson = async () => {
            try {
                const response = await fetch(`/api/lessons/${id}`, {
                    credentials: 'include'
                });
                
                if (!response.ok) {
                    throw new Error(await response.text());
                }

                const data = await response.json();
                if (data.error) {
                    throw new Error(data.error);
                }

                setLesson(data);
                setError(null);
            } catch (err) {
                console.error('Erro ao carregar aula:', err);
                setError(err instanceof Error ? err.message : 'Erro ao carregar aula');
            } finally {
                setLoading(false);
            }
        };

        fetchLesson();
    }, [id]);

    if (loading) {
        return (
            <div className="w-full max-w-4xl mx-auto p-4">
                <Card className="p-8">
                    <div className="flex items-center justify-center">
                        <p className="text-lg">Carregando aula...</p>
                    </div>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full max-w-4xl mx-auto p-4">
                <Card className="p-8">
                    <div className="flex items-center justify-center">
                        <p className="text-lg text-red-500">{error}</p>
                    </div>
                </Card>
            </div>
        );
    }

    if (!lesson) {
        return (
            <div className="w-full max-w-4xl mx-auto p-4">
                <Card className="p-8">
                    <div className="flex items-center justify-center">
                        <p className="text-lg">Aula não encontrada</p>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4">
            <div className="w-full max-w-4xl mx-auto">
                <LessonProvider lessonId={lesson.id}>
                    <RoomDisplay lesson={lesson} />
                </LessonProvider>
            </div>
        </div>
    );
}