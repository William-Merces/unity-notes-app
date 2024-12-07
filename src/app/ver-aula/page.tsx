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
    const [isMobile, setIsMobile] = useState(false);
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    // Responsive design check
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

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

    // Loading state component
    const LoadingCard = () => (
        <div className="w-full max-w-4xl mx-auto p-4">
            <Card className="p-8">
                <div className="flex items-center justify-center">
                    <p className="text-lg">Carregando aula...</p>
                </div>
            </Card>
        </div>
    );

    // Error state component
    const ErrorCard = ({ message }: { message: string }) => (
        <div className="w-full max-w-4xl mx-auto p-4">
            <Card className="p-8">
                <div className="flex items-center justify-center">
                    <p className="text-lg text-red-500">{message}</p>
                </div>
            </Card>
        </div>
    );

    // Render loading or error states
    if (loading) return <LoadingCard />;
    if (error) return <ErrorCard message={error} />;
    if (!lesson) return <ErrorCard message="Aula não encontrada" />;

    return (
        <div className="min-h-screen p-2 sm:p-4">
            <div className="w-full max-w-4xl mx-auto">
                <LessonProvider lessonId={lesson.id}>
                    <RoomDisplay lesson={lesson} />
                </LessonProvider>
            </div>
        </div>
    );
}