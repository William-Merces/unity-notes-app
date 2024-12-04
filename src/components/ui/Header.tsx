// /src/components/ui/Header.tsx
'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button/button';

export default function Header() {
    const { user, logout } = useAuth();

    if (!user) {
        return (
            <header className="w-full border-b">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <Link href="/" className="font-semibold text-lg">
                        Unity Notes
                    </Link>
                    <div className="flex gap-4">
                        <Link href="/auth/login">
                            <Button variant="ghost">Login</Button>
                        </Link>
                        <Link href="/auth/register">
                            <Button>Registrar</Button>
                        </Link>
                    </div>
                </div>
            </header>
        );
    }

    return (
        <header className="w-full border-b">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <Link href="/" className="font-semibold text-lg">
                        Unity Notes
                    </Link>
                    <nav className="flex gap-4">
                        <Link href="/minhas-classes">
                            <Button variant="ghost">Minhas Classes</Button>
                        </Link>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                        {user.name}
                    </span>
                    <Button variant="ghost" onClick={logout}>
                        Sair
                    </Button>
                </div>
            </div>
        </header>
    );
}