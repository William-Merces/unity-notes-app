// src/app/client-layout.tsx

'use client';

import { AuthProvider } from '@/contexts/AuthContext'

export function ClientLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <AuthProvider>
            <main className="min-h-screen">
                {children}
            </main>
        </AuthProvider>
    )
}