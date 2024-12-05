// src/app/lessons/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card/card';
import { useAuth } from '@/contexts/AuthContext';

export default function Lessons() {
    const [lessons, setLessons] = useState<{ id: string; title: string; ward: { name: string } }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { user } = useAuth();

    useEffect(() => {
        const fetchLessons = async () => {
            try {
                const response = await fetch('/api/lessons', {
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error(await response.text());
                }

                const data = await response.json();
                if (data.error) {
                    throw new Error(data.error);
                }

                setLessons(data);
                setError(null);
            } catch (err) {
                console.error('Erro ao carregar aulas:', err);
                setError(err instanceof Error ? err.message : 'Erro ao carregar aulas');
            } finally {
                setLoading(false);
            }
        };

        fetchLessons();
    }, []);

    if (loading) {
        return (
            <div className="w-full max-w-4xl mx-auto p-4">
                <Card className="p-8">
                    <div className="flex items-center justify-center">
                        <p className="text-lg">Carregando aulas...</p>
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

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            {lessons.map(lesson => (
                <Card key={lesson.id} className="p-8 mb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold">{lesson.title}</h2>
                            <p className="text-gray-600">{lesson.ward.name}</p>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => router.push(`/ver-aula?id=${lesson.id}`)}
                                className="bg-blue-500 text-white px-4 py-2 rounded"
                            >
                                Ver Aula
                            </button>
                            {user?.role === 'professor' && (
                                <>
                                    <button
                                        onClick={() => router.push(`/editar-aula?id=${lesson.id}`)}
                                        className="bg-yellow-500 text-white px-4 py-2 rounded"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => {
                                            // Implementar lógica de exclusão
                                        }}
                                        className="bg-red-500 text-white px-4 py-2 rounded"
                                    >
                                        Excluir
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}