import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Unity Notes',
  description: 'Sistema de anotações para aulas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={inter.className}>
      <body className="min-h-screen bg-background">
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}