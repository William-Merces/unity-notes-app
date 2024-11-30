'use client';

import { useEffect, useState } from 'react';
import { RoomDisplay } from '@/components/room/RoomDisplay';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card/card';

export default function VerAula() {
    const [lesson, setLesson] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    useEffect(() => {
        if (id) {
            setLoading(true);
            fetch(`/api/lessons/${id}`)
                .then(res => res.json())
                .then(data => {
                    if (!data.error) {
                        setLesson(data);
                    }
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [id]);

    if (loading) {
        return (
            <main className="min-h-screen p-4">
                <div className="w-full max-w-4xl mx-auto">
                    <Card className="p-8">
                        <div className="flex items-center justify-center">
                            <p className="text-lg">Carregando aula...</p>
                        </div>
                    </Card>
                </div>
            </main>
        );
    }

    if (!lesson) {
        return (
            <main className="min-h-screen p-4">
                <div className="w-full max-w-4xl mx-auto">
                    <Card className="p-8">
                        <div className="flex items-center justify-center">
                            <p className="text-lg">Aula não encontrada</p>
                        </div>
                    </Card>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen p-4">
            <div className="w-full max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Aula Atual</h1>
                <RoomDisplay lesson={lesson} />
            </div>
        </main>
    );
}