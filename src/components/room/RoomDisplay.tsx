'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card/card';
import { Button } from '@/components/ui/button/button';
import { Input } from '@/components/ui/input/input';
import {
    ChevronLeft,
    ChevronRight,
    Book,
    HelpCircle,
    BarChart2,
    Hand,
    Heart,
    MessageCircle,
    Users,
    Lightbulb,
    PenTool,
    Copy,
    Check,
    ExternalLink
} from 'lucide-react';

const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
};

interface RoomDisplayProps {
    lesson: any; // Você pode definir a interface completa do lesson aqui
}

export function RoomDisplay({ lesson }: RoomDisplayProps) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showPollResults, setShowPollResults] = useState(false);
    const [selectedPollOption, setSelectedPollOption] = useState<string | null>(null);
    const [handRaised, setHandRaised] = useState(false);
    const [liked, setLiked] = useState(false);
    const [personalNote, setPersonalNote] = useState('');
    const [showNoteInput, setShowNoteInput] = useState(false);
    const [participantCount, setParticipantCount] = useState(12);
    const [handsRaisedCount, setHandsRaisedCount] = useState(3);
    const [reactionCount, setReactionCount] = useState(0);
    const [copied, setCopied] = useState(false);

    const slides = [
        {
            type: 'welcome',
            content: {
                title: lesson.title || 'Aula da Escola Dominical',
                hymn: lesson.firstHymn,
                prayer: lesson.firstPrayer,
                announcements: lesson.announcements
            }
        },
        ...lesson.slides.map((slide: any, index: number) => ({
            type: 'quote',
            number: index + 1,
            content: slide.content,
            resources: slide.resources
        })),
        {
            type: 'closing',
            content: {
                hymn: lesson.lastHymn,
                prayer: lesson.lastPrayer
            }
        }
    ];

    const renderTopBar = () => (
        <div className="bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-4 z-50 rounded-lg border shadow-sm p-4">
            <div className="flex items-center justify-between">
                <div className="flex gap-4">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setHandRaised(!handRaised);
                            setHandsRaisedCount(prev => handRaised ? prev - 1 : prev + 1);
                        }}
                        className={handRaised ? 'bg-primary/10' : ''}
                    >
                        <Hand className={`h-4 w-4 mr-2 ${handRaised ? 'text-primary' : ''}`} />
                        {handRaised ? 'Baixar Mão' : 'Levantar Mão'}
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => {
                            setLiked(!liked);
                            setReactionCount(prev => liked ? prev - 1 : prev + 1);
                        }}
                        className={liked ? 'bg-red-50' : ''}
                    >
                        <Heart className={`h-4 w-4 mr-2 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
                        {reactionCount > 0 && reactionCount}
                    </Button>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{participantCount} participantes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Hand className="h-4 w-4" />
                        <span>{handsRaisedCount} mãos levantadas</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderWelcomeSlide = () => (
        <motion.div
            className="space-y-8 p-8"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={fadeIn}
        >
            <motion.div
                className="text-center space-y-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                <h1 className="text-4xl font-bold">{slides[0].content.title}</h1>

                <div className="space-y-4">
                    <div>
                        <h2 className="text-xl font-medium">Hino de Abertura</h2>
                        <a
                            href={slides[0].content.hymn}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center justify-center gap-2"
                        >
                            {slides[0].content.hymn}
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    </div>

                    <div>
                        <h2 className="text-xl font-medium">Primeira Oração</h2>
                        <p className="text-muted-foreground">{slides[0].content.prayer}</p>
                    </div>

                    {slides[0].content.announcements && (
                        <div className="border-t pt-4 mt-4">
                            <h2 className="text-xl font-medium mb-2">Anúncios</h2>
                            <p className="text-muted-foreground whitespace-pre-wrap">
                                {slides[0].content.announcements}
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );

    const renderClosingSlide = () => (
        <motion.div
            className="space-y-8 p-8"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={fadeIn}
        >
            <motion.div
                className="text-center space-y-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                <h1 className="text-4xl font-bold">Encerramento</h1>

                <div className="space-y-4">
                    <div>
                        <h2 className="text-xl font-medium">Último Hino</h2>
                        <a
                            href={slides[slides.length - 1].content.hymn}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center justify-center gap-2"
                        >
                            {slides[slides.length - 1].content.hymn}
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    </div>

                    <div>
                        <h2 className="text-xl font-medium">Última Oração</h2>
                        <p className="text-muted-foreground">{slides[slides.length - 1].content.prayer}</p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );

    const renderResource = (resource: any) => {
        switch (resource.type) {
            case 'question':
                return (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <HelpCircle className="h-6 w-6 text-primary" />
                            <h3 className="text-xl font-medium">{resource.content}</h3>
                        </div>

                        {resource.suggestions && resource.suggestions.length > 0 && (
                            <div className="pl-8 space-y-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowSuggestions(!showSuggestions)}
                                >
                                    {showSuggestions ? 'Ocultar Sugestões' : 'Ver Sugestões'}
                                </Button>

                                <AnimatePresence>
                                    {showSuggestions && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <ul className="pl-4 space-y-2">
                                                {resource.suggestions.map((suggestion: string, i: number) => (
                                                    <li key={i} className="flex items-start gap-2">
                                                        <Lightbulb className="h-5 w-5 text-primary/60 shrink-0 mt-0.5" />
                                                        <span>{suggestion}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                );

            case 'scripture':
                return (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Book className="h-6 w-6 text-primary" />
                            <h3 className="text-xl font-medium">{resource.reference}</h3>
                        </div>
                        <div className="pl-8">
                            <blockquote className="border-l-4 border-primary/30 pl-4 italic">
                                {resource.content}
                            </blockquote>
                        </div>
                    </div>
                );

            case 'poll':
                return (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <BarChart2 className="h-6 w-6 text-primary" />
                            <h3 className="text-xl font-medium">{resource.question}</h3>
                        </div>

                        <div className="pl-8 space-y-4">
                            {(Array.isArray(resource.options) ? resource.options : []).map((option: string, index: number) => (
                                <Button
                                    key={index}
                                    variant="outline"
                                    className={`w-full justify-start ${selectedPollOption === option ? 'bg-primary/10' : ''
                                        }`}
                                    onClick={() => setSelectedPollOption(option)}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={`w-4 h-4 rounded-full border-2 ${selectedPollOption === option
                                            ? 'border-primary bg-primary'
                                            : 'border-primary'
                                            }`} />
                                        <span>{option}</span>
                                    </div>
                                </Button>
                            ))}

                            {selectedPollOption && (
                                <Button
                                    variant="outline"
                                    onClick={() => setShowPollResults(!showPollResults)}
                                >
                                    {showPollResults ? 'Ocultar Resultados' : 'Ver Resultados'}
                                </Button>
                            )}

                            <AnimatePresence>
                                {showPollResults && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="space-y-4"
                                    >
                                        {(Array.isArray(resource.options) ? resource.options : []).map((option: string) => {
                                            const percentage = Math.floor(Math.random() * 100);
                                            return (
                                                <div key={option} className="space-y-1">
                                                    <div className="flex justify-between text-sm">
                                                        <span>{option}</span>
                                                        <span>{percentage}%</span>
                                                    </div>
                                                    <div className="h-2 bg-primary/10 rounded-full overflow-hidden">
                                                        <motion.div
                                                            className="h-full bg-primary"
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${percentage}%` }}
                                                            transition={{ duration: 1, ease: "easeOut" }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                );
        }
    };

    const renderQuoteSlide = (slide: any) => (
        <motion.div
            className="space-y-8 p-8"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={fadeIn}
        >
            <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <div className="relative">
                    <blockquote className="text-2xl leading-relaxed">
                        {slide.content}
                    </blockquote>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="absolute -right-2 -top-2"
                        onClick={() => {
                            navigator.clipboard.writeText(slide.content);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                        }}
                    >
                        {copied ? (
                            <Check className="h-4 w-4 text-green-500" />
                        ) : (
                            <Copy className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </motion.div>

            {slide.resources?.map((resource: any, index: number) => (
                <motion.div
                    key={index}
                    className="pt-8 border-t"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                >
                    {renderResource(resource)}
                </motion.div>
            ))}

            {showNoteInput && (
                <motion.div
                    className="pt-4"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                >
                    <div className="space-y-2">
                        <Input
                            value={personalNote}
                            onChange={(e) => setPersonalNote(e.target.value)}
                            placeholder="Digite sua nota pessoal..."
                            className="w-full"
                        />
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowNoteInput(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowNoteInput(false)}
                            >
                                Salvar
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}

            {!showNoteInput && (
                <motion.div
                    className="pt-4"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                >
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowNoteInput(true)}
                        className="w-full justify-start"
                    >
                        <PenTool className="h-4 w-4 mr-2" />
                        Adicionar nota pessoal
                    </Button>
                </motion.div>
            )}
        </motion.div>
    );

    const renderCurrentSlide = () => {
        const slide = slides[currentSlide];

        if (currentSlide === 0) {
            return renderWelcomeSlide();
        }

        if (currentSlide === slides.length - 1) {
            return renderClosingSlide();
        }

        return renderQuoteSlide(slide);
    };

    const renderBottomBar = () => (
        <div className="flex justify-between items-center bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky bottom-4 rounded-lg border shadow-sm p-4">
            <Button
                onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                disabled={currentSlide === 0}
                variant="outline"
            >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Anterior
            </Button>

            <div className="flex flex-col items-center">
                <span className="text-sm font-medium">
                    Slide {currentSlide + 1} de {slides.length}
                </span>
                <span className="text-xs text-muted-foreground">
                    {currentSlide === 0 ? 'Boas-vindas' :
                        currentSlide === slides.length - 1 ? 'Encerramento' :
                            'Citação'}
                </span>
            </div>

            <Button
                onClick={() => setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1))}
                disabled={currentSlide === slides.length - 1}
                variant="outline"
            >
                Próximo
                <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
        </div>
    );

    return (
        <div className="min-h-screen bg-background p-4">
            <div className="max-w-5xl mx-auto space-y-6">
                {renderTopBar()}

                <Card className="min-h-[600px] overflow-hidden">
                    <CardContent className="p-0">
                        <AnimatePresence mode="wait">
                            {renderCurrentSlide()}
                        </AnimatePresence>
                    </CardContent>
                </Card>

                {renderBottomBar()}
            </div>
        </div>
    );
}