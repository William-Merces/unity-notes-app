import { Suspense } from 'react';
import { getEnrolledClasses } from '@/lib/api/classes';
import CurrentLessonBar from '@/components/class/CurrentLessonBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card/card';
import { Button } from '@/components/ui/button/button';
import Link from 'next/link';
import { Users, LogIn, Book } from 'lucide-react';

export default async function HomePage() {
    const enrolledClasses = await getEnrolledClasses();
    
    // Processa as classes para identificar aulas atuais e próximas
    const processedClasses = enrolledClasses.map(classItem => ({
        id: classItem.id,
        name: classItem.name,
        ward: classItem.ward,
        currentLesson: classItem.lessons?.find(l => l.isActive),
        nextLesson: classItem.lessons?.[0],
        organization: classItem.organization
    }));

    // Separa classes com aulas ativas
    const activeClasses = processedClasses.filter(c => c.currentLesson);
    const upcomingClasses = processedClasses.filter(c => !c.currentLesson && c.nextLesson);

    return (
        <main className="flex min-h-screen flex-col bg-background">
            {/* Barra de Aula Atual/Ativa */}
            <Suspense fallback={<div className="h-24 bg-muted animate-pulse" />}>
                <CurrentLessonBar 
                    enrolledClasses={processedClasses}
                    fallbackMessage="Nenhuma aula acontecendo agora. Veja abaixo as próximas aulas."
                />
            </Suspense>

            <div className="container mx-auto p-4 space-y-6">
                {/* Ações Rápidas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/classes?mode=explore">
                        <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                            <CardContent className="flex items-center gap-4 p-6">
                                <div className="p-3 bg-primary/10 rounded-full">
                                    <LogIn className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Entrar como Visitante</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Acesse uma aula em qualquer ala
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/classes">
                        <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                            <CardContent className="flex items-center gap-4 p-6">
                                <div className="p-3 bg-primary/10 rounded-full">
                                    <Users className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Minhas Classes</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Gerencie suas matrículas
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                {/* Próximas Aulas */}
                {upcomingClasses.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Book className="h-5 w-5" />
                                Próximas Aulas
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {upcomingClasses.map(classItem => (
                                <div 
                                    key={classItem.id}
                                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                >
                                    <div>
                                        <h4 className="font-medium">{classItem.name}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {classItem.ward.name}
                                        </p>
                                        {classItem.nextLesson && (
                                            <p className="text-sm text-primary mt-1">
                                                Próxima Aula: {classItem.nextLesson.title}
                                            </p>
                                        )}
                                    </div>
                                    <Link 
                                        href={`/aula/${classItem.nextLesson?.id}`}
                                        className="shrink-0 ml-4"
                                    >
                                        <Button>
                                            Estudar
                                        </Button>
                                    </Link>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* Se não houver classes matriculadas */}
                {processedClasses.length === 0 && (
                    <Card>
                        <CardContent className="p-6 text-center space-y-4">
                            <h3 className="text-lg font-medium">
                                Bem-vindo ao Unity Notes
                            </h3>
                            <p className="text-muted-foreground">
                                Matricule-se em uma classe para começar a participar das aulas
                            </p>
                            <Link href="/classes?mode=explore">
                                <Button>
                                    Explorar Classes Disponíveis
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>
        </main>
    );
}