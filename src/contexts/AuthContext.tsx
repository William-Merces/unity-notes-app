// src/contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    name: string;
    email: string;
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

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
}

interface RegisterData {
    name: string;
    email: string;
    password: string;
    stake?: string;
    ward?: string;
    organization?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            console.log('Checking authentication...');
            const response = await fetch('/api/auth/me', {
                credentials: 'include'
            });
            
            console.log('Auth check response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                if (data.user) {
                    console.log('User found:', data.user);
                    setUser(data.user);
                } else {
                    console.log('No user data');
                    setUser(null);
                }
            } else {
                console.log('Auth check failed');
                setUser(null);
            }
        } catch (error) {
            console.error('Auth check error:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        console.log('Starting login process...');
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        });

        console.log('Login response status:', response.status);
        
        if (!response.ok) {
            const error = await response.json();
            console.error('Login error:', error);
            throw new Error(error.error || 'Login failed');
        }

        const data = await response.json();
        console.log('Login successful, user data:', data);
        setUser(data.user);
    };

    const logout = async () => {
        try {
            console.log('Starting logout process...');
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });

            console.log('Logout response status:', response.status);

            if (!response.ok) {
                throw new Error('Logout failed');
            }

            setUser(null);
            console.log('Logout successful, redirecting...');
            router.replace('/auth/login');
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    };

    const register = async (data: RegisterData) => {
        console.log('Starting registration process...');
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'include'
        });

        console.log('Registration response status:', response.status);

        if (!response.ok) {
            const error = await response.json();
            console.error('Registration error:', error);
            throw new Error(error.error || 'Registration failed');
        }

        const userData = await response.json();
        console.log('Registration successful, user data:', userData);
        setUser(userData.user);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};