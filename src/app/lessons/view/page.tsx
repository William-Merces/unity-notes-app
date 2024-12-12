'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LessonProvider } from '@/contexts/LessonContext';
import { RoomDisplay } from '@/components/room/RoomDisplay';
import { Card } from '@/components/ui/card/card';
import { Lesson, Class } from '@/types/lesson';
import { getEnrolledClasses } from '@/lib/api/classes';
import { Button } from '@/components/ui/button/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ViewLessonPage() {
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [enrolledClasses, setEnrolledClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const lessonId = searchParams.get('id');
    const { user } = useAuth();

    useEffect(() => {
        if (!lessonId) {
            router.push('/lessons');
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                const [lessonResponse, classesData] = await Promise.all([
                    fetch(`/api/lessons/${lessonId}`, {
                        credentials: 'include',
                        cache: 'no-store'
                    }),
                    getEnrolledClasses()
                ]);

                if (!lessonResponse.ok) {
                    const errorData = await lessonResponse.json();
                    throw new Error(errorData.error || 'Failed to load lesson');
                }

                const data = await lessonResponse.json();
                setLesson(data);
                setEnrolledClasses(classesData);
            } catch (err) {
                console.error('Error loading lesson:', err);
                setError(err instanceof Error ? err.message : 'Error loading lesson');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [lessonId, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 flex items-center justify-center">
                <Card className="bg-gray-900/90 backdrop-blur border-white/10 p-8">
                    <div className="flex items-center space-x-4">
                        <div className="w-6 h-6 border-2 border-blue-400 rounded-full animate-spin border-t-transparent" />
                        <span className="text-lg font-medium text-white">Loading lesson...</span>
                    </div>
                </Card>
            </div>
        );
    }

    if (error || !lesson) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900">
                <div className="container mx-auto p-4">
                    <div className="mb-4">
                        <Link href="/lessons">
                            <Button variant="ghost" className="text-white">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Lessons
                            </Button>
                        </Link>
                    </div>
                    <Card className="bg-gray-900/90 backdrop-blur border-white/10 p-8">
                        <div className="text-center">
                            <span className="text-lg text-red-400">{error || 'Lesson not found'}</span>
                            <p className="mt-4 text-sm text-gray-400">
                                Please try again later or contact support if the problem persists.
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <LessonProvider lessonId={lessonId!}>
            <RoomDisplay
                lesson={lesson}
                enrolledClasses={enrolledClasses}
                onSlideChange={() => {}}
                onRaiseHand={() => {}}
                onLowerHand={() => {}}
                onSync={() => {}}
                onVotePoll={() => {}}
                currentSlide={lesson.currentSlide}
                isSync={true}
                handRaises={[]}
                connectedUsers={0}
                isTeacher={user?.role === 'TEACHER'}
            />
        </LessonProvider>
    );
}