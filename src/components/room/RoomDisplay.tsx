// src/components/room/RoomDisplay.tsx

'use client';

import { useLessonContext } from '@/contexts/LessonContext';
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
    Users,
    Lightbulb,
    PenTool,
    Copy,
    Check,
    ExternalLink,
    Wifi,
    WifiOff
} from 'lucide-react';
import { Lesson, Slide } from '@/types/lesson';

const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
};

interface RoomDisplayProps {
    lesson: Lesson;
}

export function RoomDisplay({ lesson }: RoomDisplayProps) {
    const {
        currentSlide,
        setCurrentSlide,
        isSync,
        setIsSync,
        participants,
        handRaises,
        raisedHand,
        raiseHand,
        lowerHand,
        isTeacher,
        giveVoice,
        pollResults: contextPollResults,
        votePoll: contextVotePoll
    } = useLessonContext();

    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedPollOption, setSelectedPollOption] = useState<string | null>(null);
    const [liked, setLiked] = useState(false);
    const [personalNote, setPersonalNote] = useState('');
    const [showNoteInput, setShowNoteInput] = useState(false);
    const [reactionCount, setReactionCount] = useState(0);
    const [copied, setCopied] = useState(false);

    const handleRaiseHand = async () => {
        if (raisedHand) {
            await lowerHand();
        } else {
            await raiseHand();
        }
    };

    const handleVotePoll = (pollId: string, option: string) => {
        setSelectedPollOption(option);
        contextVotePoll(pollId, option);
    };

    const renderParticipantsList = () => (
        <Card className="my-4">
            <CardContent className="p-4">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-medium">Participantes ({participants.length})</h3>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <div className="divide-y">
                        {participants.map(participant => (
                            <div
                                key={participant.userId}
                                className="py-2 flex items-center justify-between"
                            >
                                <span className="flex items-center gap-2">
                                    {participant.userName}
                                    {participant.isGuest && (
                                        <span className="text-xs text-muted-foreground">(Visitante)</span>
                                    )}
                                </span>
                                {handRaises.find(h => h.userId === participant.userId) && (
                                    <div className="flex items-center gap-2">
                                        <Hand className="h-4 w-4 text-primary" />
                                        {isTeacher && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => giveVoice(participant.userId)}
                                            >
                                                Dar a palavra
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const renderTopBar = () => (
        <div className="bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-4 z-50 rounded-lg border shadow-sm p-4">
            <div className="flex items-center justify-between">
                <div className="flex gap-4">
                    <Button
                        variant="outline"
                        onClick={handleRaiseHand}
                        className={raisedHand ? 'bg-primary/10' : ''}
                    >
                        <Hand className={`h-4 w-4 mr-2 ${raisedHand ? 'text-primary' : ''}`} />
                        {raisedHand ? 'Baixar Mão' : 'Levantar Mão'}
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

                    <Button
                        variant="outline"
                        onClick={() => setIsSync(!isSync)}
                        className={isSync ? 'bg-primary/10' : ''}
                    >
                        {isSync ? (
                            <Wifi className="h-4 w-4 mr-2 text-primary" />
                        ) : (
                            <WifiOff className="h-4 w-4 mr-2" />
                        )}
                        {isSync ? 'Sincronizado' : 'Sincronizar'}
                    </Button>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{participants.length} participantes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Hand className="h-4 w-4" />
                        <span>{handRaises.length} mãos levantadas</span>
                    </div>
                </div>
            </div>

            {handRaises.length > 0 && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Mãos Levantadas:</h4>
                    <ul className="space-y-2">
                        {handRaises.map((raise) => (
                            <li key={raise.userId} className="flex items-center gap-2">
                                <Hand className="h-4 w-4 text-primary" />
                                <span>{raise.userName}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
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
                const pollVotes = contextPollResults[resource.id] || {};
                const totalVotes = Object.values(pollVotes).reduce((sum: number, count: number) => sum + count, 0);

                return (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <BarChart2 className="h-6 w-6 text-primary" />
                            <h3 className="text-xl font-medium">{resource.question}</h3>
                        </div>

                        <div className="pl-8 space-y-4">
                            {(Array.isArray(resource.options) ? resource.options : []).map((option: string) => {
                                const voteCount = pollVotes[option] || 0;
                                const percentage = totalVotes ? Math.round((voteCount / totalVotes) * 100) : 0;

                                return (
                                    <div key={option} className="space-y-2">
                                        <Button
                                            variant="outline"
                                            className={`w-full justify-start ${selectedPollOption === option ? 'bg-primary/10' : ''}`}
                                            onClick={() => handleVotePoll(resource.id, option)}
                                            disabled={selectedPollOption !== null}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className={`w-4 h-4 rounded-full border-2 ${selectedPollOption === option
                                                    ? 'border-primary bg-primary'
                                                    : 'border-primary'
                                                    }`} />
                                                <span>{option}</span>
                                            </div>
                                        </Button>

                                        {selectedPollOption && (
                                            <div className="relative h-2 bg-primary/10 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="absolute inset-y-0 left-0 bg-primary"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${percentage}%` }}
                                                    transition={{ duration: 1, ease: "easeOut" }}
                                                />
                                            </div>
                                        )}

                                        {selectedPollOption && (
                                            <div className="text-sm text-muted-foreground">
                                                {voteCount} votos ({percentage}%)
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
        }
    };

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
                <h1 className="text-4xl font-bold">{lesson.title}</h1>

                <div className="space-y-4">
                    <div>
                        <h2 className="text-xl font-medium">Hino de Abertura</h2>
                        <a
                            href={lesson.firstHymn}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center justify-center gap-2"
                        >
                            {lesson.firstHymn}
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    </div>

                    <div>
                        <h2 className="text-xl font-medium">Primeira Oração</h2>
                        <p className="text-muted-foreground">{lesson.firstPrayer}</p>
                    </div>

                    {lesson.announcements && (
                        <div className="border-t pt-4 mt-4">
                            <h2 className="text-xl font-medium mb-2">Anúncios</h2>
                            <p className="text-muted-foreground whitespace-pre-wrap">
                                {lesson.announcements}
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
                            href={lesson.lastHymn}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center justify-center gap-2"
                        >
                            {lesson.lastHymn}
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    </div>

                    <div>
                        <h2 className="text-xl font-medium">Última Oração</h2>
                        <p className="text-muted-foreground">{lesson.lastPrayer}</p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );

    const renderQuoteSlide = (slide: Slide) => (
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

            {slide.resources?.map((resource, index) => (
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

            {showNoteInput ? (
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
            ) : (
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
        if (currentSlide === 0) {
            return renderWelcomeSlide();
        }

        if (currentSlide === lesson.slides.length + 1) {
            return renderClosingSlide();
        }

        return renderQuoteSlide(lesson.slides[currentSlide - 1]);
    };

    const renderBottomBar = () => (
        <div className="flex justify-between items-center bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky bottom-4 rounded-lg border shadow-sm p-4">
            <Button
                onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                disabled={currentSlide === 0}
                variant="outline"
            >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Anterior
            </Button>

            <div className="flex flex-col items-center">
                <span className="text-sm font-medium">
                    Slide {currentSlide + 1} de {lesson.slides.length + 2}
                </span>
                <span className="text-xs text-muted-foreground">
                    {currentSlide === 0 ? 'Boas-vindas' :
                        currentSlide === lesson.slides.length + 1 ? 'Encerramento' :
                            'Citação'}
                </span>
            </div>

            <Button
                onClick={() => setCurrentSlide(Math.min(lesson.slides.length + 1, currentSlide + 1))}
                disabled={currentSlide === lesson.slides.length + 1}
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

                {renderParticipantsList()}

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