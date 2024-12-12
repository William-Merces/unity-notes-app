// src/components/class/CurrentLessonBar.tsx

'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card/card';
import { Button } from '@/components/ui/button/button';
import { ChevronRight, PlayCircle, ChevronDown, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/utils';
import { Class } from '@/types/lesson';

interface CurrentLessonBarProps {
    enrolledClasses: Class[];
    fallbackMessage?: string;
}

export default function CurrentLessonBar({ 
    enrolledClasses = [], 
    fallbackMessage = 'Nenhuma aula disponível no momento. Aguarde atualizações.'
}: CurrentLessonBarProps) {
    const [isOpen, setIsOpen] = useState(false);
    
    // Encontra classes com aulas ativas ou próximas
    const classesWithActiveLesson = enrolledClasses.filter(c => c.currentLesson);
    const classesWithNextLesson = enrolledClasses.filter(c => c.nextLesson);
    
    // Se não houver nenhuma classe matriculada
    if (!enrolledClasses.length) {
        return (
            <div className="w-full max-w-6xl mx-auto px-4 mb-8">
                <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
                    <div className="p-6 text-center">
                        <p className="text-muted-foreground">{fallbackMessage}</p>
                    </div>
                </Card>
            </div>
        );
    }

    // Se houver apenas uma classe com aula ativa
    if (classesWithActiveLesson.length === 1) {
        const activeClass = classesWithActiveLesson[0];
        return (
            <div className="w-full max-w-6xl mx-auto px-4 mb-8">
                <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
                    <motion.div
                        className="p-6 flex items-center justify-between"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center gap-4">
                            <PlayCircle className="h-8 w-8 text-primary animate-pulse" />
                            <div>
                                <h3 className="font-medium text-lg">Aula em Andamento</h3>
                                <p className="text-sm text-muted-foreground">
                                    {activeClass.name} • {activeClass.ward?.name || 'Ala não especificada'}
                                </p>
                            </div>
                        </div>
                        {activeClass.currentLesson && (
                            <Link href={`/lessons/view?id=${activeClass.currentLesson.id}`}>
                                <Button size="lg" className="bg-primary hover:bg-primary/90">
                                    Acessar Aula
                                    <ChevronRight className="h-4 w-4 ml-2" />
                                </Button>
                            </Link>
                        )}
                    </motion.div>
                </Card>
            </div>
        );
    }

    // Se não houver aulas ativas, mas houver próximas aulas
    if (!classesWithActiveLesson.length && classesWithNextLesson.length === 1) {
        const nextClass = classesWithNextLesson[0];
        return (
            <div className="w-full max-w-6xl mx-auto px-4 mb-8">
                <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
                    <motion.div
                        className="p-6 flex items-center justify-between"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center gap-4">
                            <PlayCircle className="h-8 w-8 text-primary" />
                            <div>
                                <h3 className="font-medium text-lg">Próxima Aula</h3>
                                <p className="text-sm text-muted-foreground">
                                    {nextClass.name} • {nextClass.ward?.name || 'Ala não especificada'}
                                </p>
                                {nextClass.nextLesson && (
                                    <p className="text-sm text-primary mt-1">
                                        {nextClass.nextLesson.title}
                                    </p>
                                )}
                            </div>
                        </div>
                        {nextClass.nextLesson && (
                            <Link href={`/lessons/view?id=${nextClass.nextLesson.id}`}>
                                <Button size="lg" variant="outline">
                                    Ver Detalhes
                                    <ChevronRight className="h-4 w-4 ml-2" />
                                </Button>
                            </Link>
                        )}
                    </motion.div>
                </Card>
            </div>
        );
    }

    // Se houver múltiplas classes
    return (
        <div className="w-full max-w-6xl mx-auto px-4 mb-8">
            <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium text-lg">Suas Classes</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsOpen(!isOpen)}
                                className="px-0 text-muted-foreground hover:text-primary"
                            >
                                Ver todas as classes
                                <ChevronDown
                                    className={cn(
                                        "h-4 w-4 ml-1 transition-transform",
                                        isOpen && "rotate-180"
                                    )}
                                />
                            </Button>
                        </div>
                    </div>

                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="space-y-2 overflow-hidden"
                            >
                                {enrolledClasses.map((classItem) => (
                                    <motion.div
                                        key={classItem.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="p-3 rounded-lg transition-colors cursor-pointer hover:bg-accent"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {classItem.currentLesson ? (
                                                    <PlayCircle className="h-4 w-4 text-primary animate-pulse" />
                                                ) : (
                                                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                                                )}
                                                <div>
                                                    <span className="font-medium">
                                                        {classItem.name}
                                                    </span>
                                                    <p className="text-sm text-muted-foreground">
                                                        {classItem.ward?.name || 'Ala não especificada'}
                                                    </p>
                                                </div>
                                            </div>
                                            {classItem.currentLesson && (
                                                <Link
                                                    href={`/lessons/view?id=${classItem.currentLesson.id}`}
                                                >
                                                    <Button size="sm">
                                                        Acessar Aula
                                                    </Button>
                                                </Link>
                                            )}
                                            {(!classItem.currentLesson && classItem.nextLesson) && (
                                                <Link
                                                    href={`/lessons/view?id=${classItem.nextLesson.id}`}
                                                >
                                                    <Button size="sm" variant="outline">
                                                        Ver Próxima
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </Card>
        </div>
    );
}