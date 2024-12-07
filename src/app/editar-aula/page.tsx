'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card/card';
import { useAuth } from '@/contexts/AuthContext';
import HymnSelector from '@/components/lesson/HymnSelector';
import DiscourseSelector from '@/components/lesson/DiscourseSelector';
import { QuestionDialog } from '@/components/lesson/content-types/QuestionDialog';
import { ScriptureDialog } from '@/components/lesson/content-types/ScriptureDialog';
import { PollDialog } from '@/components/lesson/content-types/PollDialog';
import { Textarea } from '@/components/ui/textarea/textarea';
import { Button } from '@/components/ui/button/button';
import { ChevronUp, ChevronDown, PlusCircle, Trash } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EditarAula() {
    interface Lesson {
        title: string;
        firstHymn: string;
        announcements: string;
        discourse: string;
        slides: { content: string; resources: any[] }[];
    }

    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const router = useRouter();
    const searchParams = useSearchParams();
    const lessonId = searchParams.get('id');
    const { user } = useAuth();

    const fetchLesson = async () => {
        try {
            const response = await fetch(`/api/lessons/${lessonId}`);
            if (!response.ok) throw new Error(await response.text());
            const data = await response.json();
            setLesson(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (lessonId) fetchLesson();
    }, [lessonId]);

    const handleResourceSave = (resource: any, type: string) => {
        setLesson(prev =>
            prev
                ? {
                    ...prev,
                    slides: prev.slides.map((slide, index) =>
                        index === currentSlide
                            ? { ...slide, resources: [...slide.resources, { type, ...resource }] }
                            : slide
                    ),
                }
                : prev
        );
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            {loading ? (
                <Card className="flex justify-center p-8 text-lg font-medium">Carregando...</Card>
            ) : error ? (
                <Card className="flex justify-center p-8 text-red-500 text-lg">{error}</Card>
            ) : (
                <Card className="p-6 space-y-8 shadow-md rounded-lg bg-gray-50">
                    <h2 className="text-2xl font-semibold text-center text-gray-800">Editar Aula</h2>
                    <form className="space-y-8">
                        {/* Detalhes Básicos */}
                        <section className="space-y-4">
                            <h3 className="text-xl font-semibold text-gray-700">Detalhes Básicos</h3>
                            <input
                                type="text"
                                placeholder="Título da aula"
                                defaultValue={lesson?.title || ''}
                                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-300"
                            />
                            {lesson && (
                                <HymnSelector value={lesson.firstHymn} onChange={() => { }} />
                            )}
                        </section>

                        {/* Anúncios */}
                        <section className="space-y-4">
                            <h3 className="text-xl font-semibold text-gray-700">Anúncios</h3>
                            <Textarea
                                defaultValue={lesson?.announcements || ''}
                                placeholder="Insira os anúncios importantes"
                                className="w-full resize-none"
                            />
                        </section>

                        {/* Discurso */}
                        <section className="space-y-4">
                            <h3 className="text-xl font-semibold text-gray-700">Discurso</h3>
                            {lesson && (
                                <DiscourseSelector value={lesson.discourse} onChange={() => { }} />
                            )}
                        </section>

                        {/* Slides */}
                        <section className="space-y-6">
                            <h3 className="text-xl font-semibold text-gray-700">Slides</h3>
                            {lesson &&
                                lesson.slides.map((slide, index) => (
                                    <motion.div
                                        key={index}
                                        className="p-4 bg-white rounded-md shadow-sm border border-gray-200"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <h4 className="text-lg font-medium text-gray-800 mb-3">Slide {index + 1}</h4>
                                        {/* Botões Organizados em Coluna */}
                                        <div className="flex flex-col space-y-2 mb-4">
                                            <Button variant="outline" size="sm">
                                                <ChevronUp className="mr-2" /> Subir
                                            </Button>
                                            <Button variant="outline" size="sm">
                                                <ChevronDown className="mr-2" /> Descer
                                            </Button>
                                            <Button variant="destructive" size="sm">
                                                <Trash className="mr-2" /> Remover
                                            </Button>
                                        </div>
                                        {/* Textarea do Slide */}
                                        <Textarea
                                            className="w-full"
                                            placeholder="Conteúdo do slide"
                                            value={slide.content}
                                            onChange={() => { }}
                                        />
                                    </motion.div>

                                ))}
                            <Button variant="secondary" className="w-full flex items-center justify-center">
                                <PlusCircle className="mr-2" /> Adicionar Slide
                            </Button>
                        </section>

                        {/* Botão Final */}
                        <Button
                            type="submit"
                            variant="default"
                            className="w-full py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                        >
                            Salvar Alterações
                        </Button>
                    </form>
                </Card>
            )}
        </div>
    );
}
