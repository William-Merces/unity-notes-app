'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card/card';
import { useAuth } from '@/contexts/AuthContext';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs/tabs';
import ClassList from '@/components/class/ClassList';

export default function Lessons() {
    const [lessons, setLessons] = useState<{ id: string; title: string; ward: { name: string } }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('available');
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

    const handleDeleteLesson = async (lessonId: string) => {
        try {
            const response = await fetch(`/api/lessons/${lessonId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            setLessons(lessons.filter(lesson => lesson.id !== lessonId));
        } catch (err) {
            console.error('Erro ao excluir aula:', err);
            setError(err instanceof Error ? err.message : 'Erro ao excluir aula');
        }
    };

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
        <div className="container max-w-5xl mx-auto p-4 space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="available">Classes Disponíveis</TabsTrigger>
                    <TabsTrigger value="enrolled">Minhas Classes</TabsTrigger>
                    {user?.role === 'TEACHER' && (
                        <TabsTrigger value="lessons">Minhas Aulas</TabsTrigger>
                    )}
                </TabsList>
                
                <TabsContent value="available">
                    <ClassList mode="available" />
                </TabsContent>
                
                <TabsContent value="enrolled">
                    <ClassList mode="enrolled" />
                </TabsContent>
                
                <TabsContent value="lessons">
                    <div className="space-y-4">
                        {lessons.map(lesson => (
                            <Card key={lesson.id} className="p-8">
                                <div>
                                    <div>
                                        <h2 className="text-xl font-bold">{lesson.title}</h2>
                                        <p className="text-gray-600">{lesson.ward.name}</p>
                                    </div>
                                    <div className="mt-4">
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => router.push(`/ver-aula?id=${lesson.id}`)}
                                            className="bg-blue-800 text-white px-4 py-2 rounded flex items-center hover:bg-blue-700"
                                        >
                                            <FaEye className="mr-2" /> Ver Aula
                                        </button>
                                        {user?.role === 'TEACHER' && (
                                            <>
                                                <button
                                                    onClick={() => router.push(`/editar-aula?id=${lesson.id}`)}
                                                    className="bg-yellow-800 text-white px-4 py-2 rounded flex items-center hover:bg-yellow-700"
                                                >
                                                    <FaEdit className="mr-2" /> Editar
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteLesson(lesson.id)}
                                                    className="bg-red-700 text-white px-4 py-2 rounded flex items-center hover:bg-red-600"
                                                >
                                                    <FaTrash className="mr-2" /> Excluir
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}