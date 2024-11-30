import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card/card';
import { Button } from '@/components/ui/button/button';
import { Hand, Heart, Users, ChevronLeft, ChevronRight } from 'lucide-react';

interface Resource {
    type: 'question' | 'scripture' | 'poll';
    content?: string;
    reference?: string;
    question?: string;
    suggestions?: string[];
    options?: string[];
}

interface Slide {
    content: string;
    resources: Resource[];
}

interface RoomDisplayProps {
    lesson?: {
        firstHymn: string;
        firstPrayer: string;
        announcements: string;
        lastHymn: string;
        lastPrayer: string;
        slides: Slide[];
    };
}

export function RoomDisplay({ lesson }: RoomDisplayProps) {
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [handRaised, setHandRaised] = useState(false);
    const [liked, setLiked] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [pollResults, setPollResults] = useState<Record<string, number>>({});
    const [showPollResults, setShowPollResults] = useState(false);

    if (!lesson) {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">Nenhuma aula disponível no momento.</p>
                </CardContent>
            </Card>
        );
    }

    const totalSlides = lesson.slides.length + 2; // +2 para os slides de início e fim
    const isFirstSlide = currentSlideIndex === 0;
    const isLastSlide = currentSlideIndex === totalSlides - 1;

    const handlePrevSlide = () => {
        setCurrentSlideIndex(prev => Math.max(0, prev - 1));
        setShowSuggestions(false);
        setShowPollResults(false);
    };

    const handleNextSlide = () => {
        setCurrentSlideIndex(prev => Math.min(totalSlides - 1, prev + 1));
        setShowSuggestions(false);
        setShowPollResults(false);
    };

    const handleVote = (option: string) => {
        setPollResults(prev => ({
            ...prev,
            [option]: (prev[option] || 0) + 1
        }));
    };

    const getCurrentContent = () => {
        if (currentSlideIndex === 0) {
            return (
                <Card>
                    <CardHeader>
                        <CardTitle>Início da Aula</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <p className="font-medium">Primeiro Hino:</p>
                            <p className="text-muted-foreground">
                                <a href={lesson.firstHymn} target="_blank" rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline">
                                    {lesson.firstHymn}
                                </a>
                            </p>
                        </div>
                        <div className="space-y-2">
                            <p className="font-medium">Primeira Oração:</p>
                            <p className="text-muted-foreground">{lesson.firstPrayer}</p>
                        </div>
                        {lesson.announcements && (
                            <div className="space-y-2">
                                <p className="font-medium">Anúncios:</p>
                                <p className="text-muted-foreground">{lesson.announcements}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            );
        }

        if (currentSlideIndex === totalSlides - 1) {
            return (
                <Card>
                    <CardHeader>
                        <CardTitle>Encerramento</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {lesson.announcements && (
                            <div className="space-y-2">
                                <p className="font-medium">Lembretes:</p>
                                <p className="text-muted-foreground">{lesson.announcements}</p>
                            </div>
                        )}
                        <div className="space-y-2">
                            <p className="font-medium">Último Hino:</p>
                            <p className="text-muted-foreground">
                                <a href={lesson.lastHymn} target="_blank" rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline">
                                    {lesson.lastHymn}
                                </a>
                            </p>
                        </div>
                        <div className="space-y-2">
                            <p className="font-medium">Última Oração:</p>
                            <p className="text-muted-foreground">{lesson.lastPrayer}</p>
                        </div>
                    </CardContent>
                </Card>
            );
        }

        const slide = lesson.slides[currentSlideIndex - 1];
        return (

            <Card>
                <CardContent className="p-6 min-h-[500px] max-h-[500px] overflow-y-auto">
                    <div className="prose dark:prose-invert max-w-none">
                        <p className="whitespace-pre-wrap">{slide.content}</p>
                    </div>
                    {slide.resources?.map((resource, index) => (
                        <div key={index} className="pt-4 border-t">
                            {resource.type === 'question' && (
                                <div className="space-y-2">
                                    <p className="font-medium">{resource.content}</p>
                                    {resource.suggestions && resource.suggestions.length > 0 && (
                                        <div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setShowSuggestions(!showSuggestions)}
                                            >
                                                {showSuggestions ? 'Ocultar Sugestões' : 'Ver Sugestões'}
                                            </Button>
                                            {showSuggestions && (
                                                <ul className="mt-2 pl-4 list-disc text-muted-foreground">
                                                    {resource.suggestions.map((suggestion, i) => (
                                                        <li key={i}>{suggestion}</li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {resource.type === 'scripture' && (
                                <div className="space-y-2">
                                    <p className="font-medium">{resource.reference}</p>
                                    <p className="text-muted-foreground">{resource.content}</p>
                                </div>
                            )}

                            {resource.type === 'poll' && resource.options && (
                                <div className="space-y-4">
                                    <p className="font-medium">{resource.question}</p>
                                    <div className="space-y-2">
                                        {resource.options.map((option, i) => (
                                            <div key={i}>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full justify-start"
                                                    onClick={() => handleVote(option)}
                                                    disabled={showPollResults}
                                                >
                                                    {option}
                                                </Button>
                                                {showPollResults && (
                                                    <div className="mt-1 text-sm text-muted-foreground">
                                                        Votos: {pollResults[option] || 0}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setShowPollResults(!showPollResults)}
                                    >
                                        {showPollResults ? 'Ocultar Resultados' : 'Ver Resultados'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setHandRaised(!handRaised)}
                        className={handRaised ? 'bg-blue-100' : ''}
                    >
                        <Hand className="h-4 w-4 mr-2" />
                        {handRaised ? 'Baixar Mão' : 'Levantar Mão'}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setLiked(!liked)}
                        className={liked ? 'bg-red-100' : ''}
                    >
                        <Heart className={`h-4 w-4 mr-2 ${liked ? 'fill-current text-red-500' : ''}`} />
                        {liked ? 'Curtido' : 'Curtir'}
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="text-sm text-muted-foreground">12 presentes</span>
                </div>
            </div>

            <div className="relative">
                {getCurrentContent()}
            </div>

            <div className="flex justify-between mt-4">
                <Button
                    onClick={handlePrevSlide}
                    disabled={isFirstSlide}
                    className="gap-2"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                </Button>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                        Slide {currentSlideIndex + 1} de {totalSlides}
                    </span>
                </div>
                <Button
                    onClick={handleNextSlide}
                    disabled={isLastSlide}
                    className="gap-2"
                >
                    Próximo
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}