'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card/card';
import { Button } from '@/components/ui/button/button';
import { Input } from '@/components/ui/input/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs/tabs';
import { Search, Plus, Users } from 'lucide-react';
import ClassList from '@/components/class/ClassList';

type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT';

interface ExtendedUser {
    id: string;
    name: string;
    email: string;
    role?: UserRole;
    ward?: {
        id: string;
        name: string;
        stake?: {
            id: string;
            name: string;
        }
    };
    organization?: string;
}

export default function MinhasClasses() {
    const { user, loading } = useAuth() as { user: ExtendedUser | null, loading: boolean };
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    useEffect(() => {
        if (!user && !loading) {
            router.push('/auth/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen p-4">
                <div className="w-full max-w-4xl mx-auto">
                    <Card className="p-8">
                        <div className="flex items-center justify-center">
                            <p className="text-lg">Carregando...</p>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <main className="min-h-screen p-4">
            <div className="w-full max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Classes</h1>
                    {user?.role === 'ADMIN' && (
                        <Button onClick={() => router.push('/criar-classe')}>
                            <Plus className="h-4 w-4 mr-2" />
                            Nova Classe
                        </Button>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar classes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>

                <Tabs defaultValue="enrolled" className="w-full">
                    <TabsList>
                        <TabsTrigger value="enrolled">Minhas Classes</TabsTrigger>
                        <TabsTrigger value="available">Classes Disponíveis</TabsTrigger>
                    </TabsList>
                    <TabsContent value="enrolled">
                        <ClassList mode="enrolled" searchTerm={searchTerm} />
                    </TabsContent>
                    <TabsContent value="available">
                        <ClassList mode="available" searchTerm={searchTerm} />
                    </TabsContent>
                </Tabs>
            </div>
        </main>
    );
}