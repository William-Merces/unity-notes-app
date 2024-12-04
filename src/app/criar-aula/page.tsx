// src/app/criar-aula/page.tsx

'use client';

import { useSearchParams } from 'next/navigation';
import LessonForm from '@/components/lesson/LessonForm';
import { Card } from '@/components/ui/card/card';

export default function CriarAula() {
    const searchParams = useSearchParams();
    const classId = searchParams.get('classId');

    if (!classId) {
        return (
            <div className="min-h-screen bg-background p-4">
                <div className="w-full max-w-4xl mx-auto">
                    <Card className="p-8">
                        <div className="flex items-center justify-center">
                            <p className="text-lg text-red-500">ID da classe não fornecido</p>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-4">
            <LessonForm classId={classId} />
        </div>
    );
}