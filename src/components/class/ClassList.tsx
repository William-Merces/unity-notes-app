// src/components/class/ClassList.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card/card';
import { Button } from '@/components/ui/button/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog/dialog';
import { Input } from '@/components/ui/input/input';
import { useAuth } from '@/contexts/AuthContext';
import { Class, Stake, Ward } from '@/types/lesson';
import { Users, ChevronDown, ChevronRight, Plus, Book, PenSquare, Home, Eye } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

    useEffect(() => {
        if (mode === 'enrolled') {
            fetchEnrolledClasses();
        } else {
            fetchStakes();
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

    const isEnrolled = (classId: string) => {
        return enrolledClasses.some(c => c.id === classId);
    };

    const handleEnroll = async (classId: string) => {
        try {
            const response = await fetch('/api/classes/enroll', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ classId })
            });

            if (response.ok) {
                await fetchEnrolledClasses();
                await fetchStakes();
            }
        } catch (error) {
            console.error('Erro ao matricular:', error);
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

    const renderClassActions = (classItem: Class, ward: Ward) => {
        const enrolled = isEnrolled(classItem.id);
        const canCreateLesson = user?.role === 'TEACHER' || user?.role === 'ADMIN';
        const belongsToWard = user?.ward?.id === ward.id;

        return (
            <div className="flex gap-2">
                {enrolled && (
                    <Link href={`/ver-aula?classId=${classItem.id}`}>
                        <Button variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Aula
                        </Button>
                    </Link>
                )}
                {belongsToWard && canCreateLesson && (
                    <Link href={`/criar-aula?classId=${classItem.id}`}>
                        <Button variant="outline">
                            <Book className="h-4 w-4 mr-2" />
                            Nova Aula
                        </Button>
                    </Link>
                )}
                {!enrolled && (
                    <Button 
                        onClick={() => handleEnroll(classItem.id)}
                        variant="default"
                    >
                        <PenSquare className="h-4 w-4 mr-2" />
                        Matricular-se
                    </Button>
                )}
            </div>
        );
    };

    // Renderiza a lista de classes matriculadas
    if (mode === 'enrolled') {
        return (
            <div className="space-y-4">
                {enrolledClasses.length === 0 ? (
                    <Card>
                        <CardContent className="p-6 text-center text-muted-foreground">
                            Você ainda não está matriculado em nenhuma classe
                        </CardContent>
                    </Card>
                ) : (
                    enrolledClasses.map(classItem => (
                        <Card key={classItem.id}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>{classItem.name}</CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                            {classItem.ward?.name}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={`/ver-aula?classId=${classItem.id}`}>
                                            <Button variant="outline">
                                                <Eye className="h-4 w-4 mr-2" />
                                                Ver Aula
                                            </Button>
                                        </Link>
                                        {(user?.role === 'TEACHER' || user?.role === 'ADMIN') && (
                                            <Link href={`/criar-aula?classId=${classItem.id}`}>
                                                <Button variant="outline">
                                                    <Book className="h-4 w-4 mr-2" />
                                                    Nova Aula
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    ))
                )}
            </div>
        );
    }

    // Renderiza a lista de classes disponíveis
    return (
        <div className="space-y-4">
            {stakes.map(stake => (
                <Card key={stake.id}>
                    <CardHeader 
                        className="cursor-pointer hover:bg-accent/50"
                        onClick={() => setExpandedStakes(prev => ({ ...prev, [stake.id]: !prev[stake.id] }))}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {expandedStakes[stake.id] ? 
                                    <ChevronDown className="h-4 w-4" /> : 
                                    <ChevronRight className="h-4 w-4" />
                                }
                                <CardTitle>{stake.name}</CardTitle>
                            </div>
                        </div>
                    </CardHeader>
                    
                    {expandedStakes[stake.id] && (
                        <CardContent className="pl-6">
                            <div className="space-y-4">
                                {stake.wards.map((ward: Ward) => (
                                    <Card key={ward.id}>
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div 
                                                        className="cursor-pointer flex items-center gap-2"
                                                        onClick={() => setExpandedWards(prev => ({ ...prev, [ward.id]: !prev[ward.id] }))}
                                                    >
                                                        {expandedWards[ward.id] ? 
                                                            <ChevronDown className="h-4 w-4" /> : 
                                                            <ChevronRight className="h-4 w-4" />
                                                        }
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

                                        {expandedWards[ward.id] && (
                                            <CardContent>
                                                <div className="space-y-2">
                                                    {ward.classes?.map((classItem: Class) => (
                                                        <div 
                                                            key={classItem.id}
                                                            className="flex items-center justify-between p-4 rounded-lg border"
                                                        >
                                                            <div>
                                                                <h3 className="font-medium">{classItem.name}</h3>
                                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                <Users className="h-4 w-4" />
                                                                    <span>{classItem._count?.enrollments || 0} alunos</span>
                                                                </div>
                                                            </div>
                                                            {renderClassActions(classItem, ward)}
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        )}
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    )}
                </Card>
            ))}
        </div>
    );
};

export default ClassList;