'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LessonProvider } from '@/contexts/LessonContext';
import { io } from 'socket.io-client';
import { RoomDisplay } from '@/components/room/RoomDisplay';
import { Card } from '@/components/ui/card/card';
import { Lesson } from '@/types/lesson';

export default function VerAula() {
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [connectedUsers, setConnectedUsers] = useState(0);
    const [handRaises, setHandRaises] = useState<any[]>([]);
    const [isSync, setIsSync] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const router = useRouter();
    const searchParams = useSearchParams();
    const lessonId = searchParams.get('id');
    const { user } = useAuth();

    const socket = io('/api/socketio', {
        auth: {
            token: user?.id
        }
    });

    useEffect(() => {
        const fetchLesson = async () => {
            try {
                const response = await fetch(`/api/lessons/${lessonId}`);
                if (!response.ok) throw new Error(await response.text());
                const data = await response.json();
                
                const transformedLesson: Lesson = {
                    ...data,
                    currentSlide: data.currentSlide ?? 0,
                    wardId: data.wardId ?? '',
                    teacherId: data.teacherId ?? '',
                    createdAt: data.createdAt ?? new Date().toISOString(),
                    updatedAt: data.updatedAt ?? new Date().toISOString(),
                    firstPrayer: data.firstPrayer ?? '',
                    lastPrayer: data.lastPrayer ?? '',
                    isActive: data.isActive ?? true,
                    slides: data.slides.map((slide: any) => ({
                        title: slide.title || "Slide",
                        content: slide.content || "",
                        type: determineSlideType(slide),
                        resources: slide.resources || [],
                        ...getAdditionalSlideProperties(slide)
                    }))
                };
                
                setLesson(transformedLesson);
                setCurrentSlide(transformedLesson.currentSlide);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        if (lessonId) fetchLesson();

        socket.on('connect', () => {
            socket.emit('join-lesson', lessonId);
        });

        socket.on('connected-users', (count) => {
            setConnectedUsers(count);
        });

        socket.on('hand-raised', (data) => {
            setHandRaises(prev => [...prev, data]);
        });

        socket.on('hand-lowered', (userId) => {
            setHandRaises(prev => prev.filter(hand => hand.userId !== userId));
        });

        socket.on('slide-changed', ({ slideIndex }) => {
            if (isSync) {
                setCurrentSlide(slideIndex);
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [lessonId, isSync]);

    const determineSlideType = (slide: any) => {
        if (slide.resources?.some((r: any) => r.type === 'question')) return 'question';
        if (slide.resources?.some((r: any) => r.type === 'scripture')) return 'scripture';
        if (slide.resources?.some((r: any) => r.type === 'poll')) return 'poll';
        return 'text';
    };

    const getAdditionalSlideProperties = (slide: any) => {
        const resource = slide.resources?.[0];
        if (!resource) return {};

        switch (resource.type) {
            case 'question':
                return {
                    suggestions: resource.suggestions || []
                };
            case 'scripture':
                return {
                    reference: resource.reference || ''
                };
            case 'poll':
                return {
                    question: resource.question || '',
                    options: resource.options || []
                };
            default:
                return {};
        }
    };

    const handleSlideChange = (slideIndex: number) => {
        setCurrentSlide(slideIndex);
        socket.emit('slide-change', { lessonId, slideIndex });
    };

    const handleRaiseHand = () => {
        socket.emit('raise-hand', lessonId);
    };

    const handleLowerHand = () => {
        socket.emit('lower-hand', lessonId);
    };

    const handleSync = () => {
        setIsSync(!isSync);
    };

    const handleVotePoll = (pollId: string, option: string) => {
        socket.emit('vote-poll', { lessonId, pollId, option });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 flex items-center justify-center">
                <Card className="bg-gray-900/90 backdrop-blur border-white/10 p-8">
                    <div className="flex items-center space-x-4">
                        <div className="w-6 h-6 border-2 border-blue-400 rounded-full animate-spin border-t-transparent" />
                        <span className="text-lg font-medium text-white">Carregando...</span>
                    </div>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 flex items-center justify-center">
                <Card className="bg-gray-900/90 backdrop-blur border-white/10 p-8">
                    <span className="text-lg text-red-400">{error}</span>
                </Card>
            </div>
        );
    }

    if (!lesson || !lessonId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 flex items-center justify-center">
                <Card className="bg-gray-900/90 backdrop-blur border-white/10 p-8">
                    <span className="text-lg text-white">Lição não encontrada</span>
                </Card>
            </div>
        );
    }

    return (
        <LessonProvider lessonId={lessonId}>
            <RoomDisplay
                lesson={lesson}
                onSlideChange={handleSlideChange}
                onRaiseHand={handleRaiseHand}
                onLowerHand={handleLowerHand}
                onSync={handleSync}
                onVotePoll={handleVotePoll}
                currentSlide={currentSlide}
                isSync={isSync}
                handRaises={handRaises}
                connectedUsers={connectedUsers}
                isTeacher={user?.role === 'teacher'}
            />
        </LessonProvider>
    );
}