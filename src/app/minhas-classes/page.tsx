//src/app/minhas-classes/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card/card';

export default function MinhasClasses() {
    interface Class {
        id: number;
        name: string;
        ward: {
            name: string;
        };
    }

    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const response = await fetch('/api/classes/enrolled', {
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error(await response.text());
                }

                const data = await response.json();
                if (data.error) {
                    throw new Error(data.error);
                }

                setClasses(data);
                setError(null);
            } catch (err) {
                console.error('Erro ao carregar classes:', err);
                setError(err instanceof Error ? err.message : 'Erro ao carregar classes');
            } finally {
                setLoading(false);
            }
        };

        fetchClasses();
    }, []);

    if (loading) {
        return (
            <div className="w-full max-w-4xl mx-auto p-4">
                <Card className="p-8">
                    <div className="flex items-center justify-center">
                        <p className="text-lg">Carregando classes...</p>
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
            {classes.map(cls => (
                <Card key={cls.id} className="p-8 mb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold">{cls.name}</h2>
                            <p className="text-gray-600">{cls.ward.name}</p>
                        </div>
                        <button
                            onClick={() => {
                                console.log('ID da classe:', cls.id);
                                router.push(`/lessons`);
                            }}
                            className="bg-blue-500 text-white px-4 py-2 rounded"
                        >
                            Ver Aulas
                        </button>
                    </div>
                </Card>
            ))}
        </div>
    );
}