'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card/card';
import { Button } from '@/components/ui/button/button';
import { useAuth } from '@/contexts/AuthContext';
import { Lesson } from '@/types/lesson';
import { Eye, Plus, Calendar, Users, BookOpen, Search } from 'lucide-react';
import { Input } from '@/components/ui/input/input';
import Link from 'next/link';

export default function LessonsPage() {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        const fetchLessons = async () => {
            try {
                const response = await fetch('/api/lessons', {
                    credentials: 'include'
                });
                
                if (!response.ok) {
                    throw new Error('Failed to load lessons');
                }

                const data = await response.json();
                setLessons(data);
            } catch (err) {
                console.error('Error loading lessons:', err);
                setError(err instanceof Error ? err.message : 'Error loading lessons');
            } finally {
                setLoading(false);
            }
        };

        fetchLessons();
    }, []);

    const filteredLessons = lessons.filter(lesson => 
        lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lesson.ward?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activeCount = lessons.filter(l => l.isActive).length;

    if (loading) {
        return (
            <div className="container mx-auto p-4">
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-6 h-6 border-2 border-primary rounded-full animate-spin border-t-transparent" />
                            Loading lessons...
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Lessons</h1>
                    <p className="text-sm text-muted-foreground">
                        {activeCount} active lessons
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search lessons..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>

                    {user?.role === 'TEACHER' && (
                        <Link href="/lessons/create">
                            <Button className="w-full sm:w-auto">
                                <Plus className="w-4 h-4 mr-2" />
                                New Lesson
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            {error && (
                <Card>
                    <CardContent className="p-4 text-center text-red-500">
                        {error}
                    </CardContent>
                </Card>
            )}

            {filteredLessons.length === 0 ? (
                <Card>
                    <CardContent className="p-6 text-center">
                        <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium">No lessons found</h3>
                        <p className="text-sm text-muted-foreground">
                            {searchTerm ? 'Try adjusting your search term' : 'Create your first lesson to get started'}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredLessons.map((lesson) => (
                        <Card key={lesson.id} className="group hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle>{lesson.title}</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    {lesson.ward?.name || 'Ward not specified'}
                                </p>
                            </CardHeader>
                            
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(lesson.createdAt).toLocaleDateString()}
                                    </div>
                                    {lesson._count?.attendance !== undefined && (
                                        <div className="flex items-center gap-1">
                                            <Users className="w-4 h-4" />
                                            {lesson._count.attendance}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex justify-end">
                                    <Link href={`/lessons/view?id=${lesson.id}`}>
                                        <Button variant="secondary">
                                            <Eye className="w-4 h-4 mr-2" />
                                            View Lesson
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}