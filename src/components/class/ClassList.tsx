// src/components/class/ClassList.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card/card';
import { Button } from '@/components/ui/button/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog/dialog';
import { Input } from '@/components/ui/input/input';
import { useAuth } from '@/contexts/AuthContext';
import { Class, Stake, Ward } from '@/types/lesson';
import { Users, ChevronDown, ChevronRight, Plus, Book, PenSquare, Home, Eye, Calendar, Check, Circle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    mode: 'enrolled' | 'available';
    searchTerm?: string;
}

const ClassList: React.FC<Props> = ({ mode, searchTerm }) => {
    const { user } = useAuth();
    const router = useRouter();
    const [stakes, setStakes] = useState<Stake[]>([]);
    const [enrolledClasses, setEnrolledClasses] = useState<Class[]>([]);
    const [expandedStakes, setExpandedStakes] = useState<Record<string, boolean>>({});
    const [expandedWards, setExpandedWards] = useState<Record<string, boolean>>({});
    const [nextSunday, setNextSunday] = useState<Date>(getNextSunday());
    const [enrollmentStatus, setEnrollmentStatus] = useState<Record<string, 'none' | 'pending' | 'enrolled'>>({});

    function getNextSunday(from: Date = new Date()): Date {
        const date = new Date(from);
        date.setDate(date.getDate() + (7 - date.getDay()));
        return date;
    }

    useEffect(() => {
        if (mode === 'enrolled') {
            fetchEnrolledClasses();
        } else {
            fetchStakes();
            fetchEnrolledClasses(); // Fetch enrolled classes for both modes
        }
    }, [mode]);

    const fetchEnrolledClasses = async () => {
        try {
            const response = await fetch('/api/classes/enrolled', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setEnrolledClasses(data);

                // Update enrollment status for all enrolled classes
                const status: Record<string, 'none' | 'pending' | 'enrolled'> = {};
                data.forEach((c: Class) => {
                    status[c.id] = 'enrolled';
                });
                setEnrollmentStatus(prev => ({ ...prev, ...status }));
            }
        } catch (error) {
            console.error('Erro ao carregar classes matriculadas:', error);
        }
    };

    const fetchStakes = async () => {
        try {
            const response = await fetch('/api/stakes', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setStakes(data);
                if (data.length === 1) {
                    setExpandedStakes({ [data[0].id]: true });
                }
            }
        } catch (error) {
            console.error('Erro ao carregar estacas:', error);
        }
    };

    const handleEnroll = async (classId: string) => {
        try {
            setEnrollmentStatus(prev => ({ ...prev, [classId]: 'pending' }));

            const response = await fetch('/api/classes/enroll', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ classId })
            });

            if (response.ok) {
                setEnrollmentStatus(prev => ({ ...prev, [classId]: 'enrolled' }));
                await fetchEnrolledClasses();
            }
        } catch (error) {
            console.error('Erro ao matricular:', error);
            setEnrollmentStatus(prev => ({ ...prev, [classId]: 'none' }));
        }
    };

    const handleJoinWard = async (wardId: string) => {
        try {
            const response = await fetch('/api/user/update/ward', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ wardId })
            });

            if (response.ok) {
                router.refresh();
                await fetchStakes();
            }
        } catch (error) {
            console.error('Erro ao associar usuário à ala:', error);
        }
    };

    const getNextClassDate = (classItem: Class): Date => {
        if (classItem.nextDate) {
            return new Date(classItem.nextDate);
        }
        return nextSunday;
    };

    const formatDate = (date: Date): string => {
        return new Intl.DateTimeFormat('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long'
        }).format(date);
    };

    const renderClassActions = (classItem: Class, ward?: Ward) => {
        const belongsToWard = user?.ward?.id === ward?.id;
        const canCreateLesson = user?.role === 'TEACHER' || user?.role === 'ADMIN';
        const nextDate = getNextClassDate(classItem);
        const isEnrolled = enrollmentStatus[classItem.id] === 'enrolled';

        return (
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Próxima aula: {formatDate(nextDate)}</span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                            {classItem._count?.enrollments || 0} alunos
                        </span>
                    </div>

                    <div className="flex gap-2">
                        <Link href="/lessons">
                            <Button variant="default">
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Aulas
                            </Button>
                        </Link>

                        {belongsToWard && canCreateLesson && (
                            <Link href={`/lessons/create?classId=${classItem.id}`}>
                                <Button variant="outline">
                                    <Book className="h-4 w-4 mr-2" />
                                    Nova Aula
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    if (mode === 'enrolled') {
        return (
            <div className="space-y-4">
                {enrolledClasses.length === 0 ? (
                    <Card>
                        <CardContent className="p-6">
                            <div className="text-center space-y-4">
                                <p className="text-muted-foreground">
                                    Você ainda não está matriculado em nenhuma classe
                                </p>
                                <Link href="/lessons">
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Explorar Classes
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <AnimatePresence>
                        {enrolledClasses.map((classItem, index) => (
                            <motion.div
                                key={classItem.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card>
                                    <CardHeader>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <CardTitle>{classItem.name}</CardTitle>
                                                    <p className="text-sm text-muted-foreground">
                                                        {classItem.ward?.name || 'Ala não especificada'}
                                                    </p>
                                                </div>
                                            </div>
                                            {renderClassActions(classItem, classItem.ward)}
                                        </div>
                                    </CardHeader>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <AnimatePresence>
                {stakes.map((stake, index) => (
                    <motion.div
                        key={stake.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card>
                            <CardHeader
                                className="cursor-pointer hover:bg-accent/50"
                                onClick={() => setExpandedStakes(prev => ({ ...prev, [stake.id]: !prev[stake.id] }))}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {expandedStakes[stake.id] ? (
                                            <ChevronDown className="h-4 w-4" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4" />
                                        )}
                                        <CardTitle>{stake.name}</CardTitle>
                                    </div>
                                </div>
                            </CardHeader>

                            <AnimatePresence>
                                {expandedStakes[stake.id] && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                    >
                                        <CardContent className="pl-6">
                                            <div className="space-y-4">
                                                {stake.wards.map((ward: Ward) => (
                                                    <Card key={ward.id}>
                                                        <CardHeader>
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <div
                                                                        className="cursor-pointer flex items-center gap-2"
                                                                        onClick={() => setExpandedWards(prev => ({
                                                                            ...prev,
                                                                            [ward.id]: !prev[ward.id]
                                                                        }))}
                                                                    >
                                                                        {expandedWards[ward.id] ? (
                                                                            <ChevronDown className="h-4 w-4" />
                                                                        ) : (
                                                                            <ChevronRight className="h-4 w-4" />
                                                                        )}
                                                                        <CardTitle className="text-lg">{ward.name}</CardTitle>
                                                                    </div>
                                                                </div>
                                                                {!user?.ward?.id && (
                                                                    <Button
                                                                        variant="outline"
                                                                        onClick={() => handleJoinWard(ward.id)}
                                                                        className="ml-4"
                                                                    >
                                                                        <Home className="h-4 w-4 mr-2" />
                                                                        Juntar-se a esta Ala
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </CardHeader>

                                                        <AnimatePresence>
                                                            {expandedWards[ward.id] && (
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: 'auto', opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                >
                                                                    <CardContent>
                                                                        <div className="space-y-4">
                                                                            {ward.classes?.map((classItem: Class) => (
                                                                                <motion.div
                                                                                    key={classItem.id}
                                                                                    className="p-4 rounded-lg border"
                                                                                    whileHover={{ scale: 1.01 }}
                                                                                    transition={{ duration: 0.2 }}
                                                                                >
                                                                                    <div className="space-y-4">
                                                                                        <h3 className="font-medium text-lg">
                                                                                            {classItem.name}
                                                                                        </h3>
                                                                                        {renderClassActions(classItem, ward)}
                                                                                    </div>
                                                                                </motion.div>
                                                                            ))}
                                                                        </div>
                                                                    </CardContent>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </Card>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Card>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ClassList;