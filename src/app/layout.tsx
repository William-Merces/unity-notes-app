// src/app/layout.tsx

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import Header from '@/components/ui/Header';
import CurrentLessonBar from '@/components/class/CurrentLessonBar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Unity Notes',
  description: 'Todos na mesma página',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          <Header />
          {/* Adiciona o CurrentLessonBar globalmente */}
          <div className="container mx-auto px-4">
            <CurrentLessonBar 
              enrolledClasses={[]} 
              fallbackMessage="Nenhuma aula atual disponível. Aguarde atualizações." 
            />
          </div>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}