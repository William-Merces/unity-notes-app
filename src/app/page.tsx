// src/app/page.tsx

import ClassList from '@/components/class/ClassList';

export default function Home() {
    return (
        <main className="min-h-screen p-4">
            <div className="w-full max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Classes Disponíveis</h1>
                <ClassList />
            </div>
        </main>
    );
}