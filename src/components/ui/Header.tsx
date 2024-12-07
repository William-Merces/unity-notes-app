//src/components/ui/Header.tsx

'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button/button';

export default function Header() {
    const { user, logout } = useAuth();

    return (
        <header className="w-full border-b bg-white shadow-sm">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <Link href="/" className="font-semibold text-lg">
                    Unity Notes
                </Link>
                {user ? (
                    <div className="flex items-center gap-4">
                        <Link href="/minhas-classes">
                            <Button variant="ghost">Minhas Classes</Button>
                        </Link>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">{user.name}</span>
                            <Button variant="ghost" onClick={logout}>
                                Sair
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-4">
                        <Link href="/auth/login">
                            <Button variant="ghost">Login</Button>
                        </Link>
                        <Link href="/auth/register">
                            <Button>Registrar</Button>
                        </Link>
                    </div>
                )}
            </div>
        </header>
    );
}