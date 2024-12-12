// src/components/room/RoomDisplay.tsx

'use client';

import { useLessonContext } from '@/contexts/LessonContext';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CurrentLessonBar from '@/components/class/CurrentLessonBar';
import { Card, CardContent } from '@/components/ui/card/card';
import { Button } from '@/components/ui/button/button';
import { Input } from '@/components/ui/input/input';
import { NavButton } from '@/components/ui/nav-button/nav-button';
import {
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
    WifiOff,
    X,
    MessageCircle,
    UserPlus,
    Circle
} from 'lucide-react';
import { Lesson, Slide, Resource } from '@/types/lesson';
import { cn } from '@/lib/utils/utils';

const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
};

const slideAnimation = {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 }
};

import { RoomDisplayProps, HandRaise, Participant } from './types';

export function RoomDisplay({
    lesson,
    enrolledClasses,
    onSlideChange,
    onRaiseHand,
    onLowerHand,
    onSync,
    onVotePoll,
    connectedUsers,
    isTeacher
}: RoomDisplayProps) {
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
        giveVoice,
        pollResults: contextPollResults,
        votePoll: contextVotePoll
    } = useLessonContext();

    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
    const [selectedPollOption, setSelectedPollOption] = useState<string | null>(null);
    const [liked, setLiked] = useState<boolean>(false);
    const [personalNote, setPersonalNote] = useState<string>('');
    const [showNoteInput, setShowNoteInput] = useState<boolean>(false);
    const [reactionCount, setReactionCount] = useState<number>(0);
    const [copied, setCopied] = useState<boolean>(false);
    const [showParticipants, setShowParticipants] = useState<boolean>(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

    const handleRaiseHand = async (): Promise<void> => {
        if (raisedHand) {
            await lowerHand();
        } else {
            await raiseHand();
        }
    };

    const handleVotePoll = (pollId: string, option: string): void => {
        setSelectedPollOption(option);
        contextVotePoll(pollId, option);
    };

    const renderResource = (resource: Resource): JSX.Element => {
        switch (resource.type) {
            case 'question':
                return (
                    <div className="space-y-4 p-4 bg-gray-800/50 backdrop-blur rounded-lg border border-white/10">
                        <div className="flex items-start gap-3">
                            <HelpCircle className="h-6 w-6 text-primary shrink-0 mt-1" />
                            <div className="space-y-2 flex-1">
                                <h3 className="text-lg font-medium">{resource.content}</h3>

                                {resource.suggestions && resource.suggestions.length > 0 && (
                                    <div className="space-y-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowSuggestions(!showSuggestions)}
                                            className="w-full justify-start"
                                        >
                                            <Lightbulb className="h-4 w-4 mr-2" />
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
                                                    <ul className="space-y-2 pl-4">
                                                        {resource.suggestions.map((suggestion, i) => (
                                                            <motion.li
                                                                key={i}
                                                                initial={{ opacity: 0, x: -20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: i * 0.1 }}
                                                                className="flex items-start gap-2"
                                                            >
                                                                <Lightbulb className="h-5 w-5 text-primary/60 shrink-0 mt-0.5" />
                                                                <span>{suggestion}</span>
                                                            </motion.li>
                                                        ))}
                                                    </ul>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 'scripture':
                return (
                    <div className="space-y-4 p-4 bg-purple-900/20 backdrop-blur rounded-lg border border-purple-500/30">
                        <div className="flex items-start gap-3">
                            <Book className="h-6 w-6 text-primary shrink-0 mt-1" />
                            <div className="space-y-2">
                                <h3 className="text-lg font-medium">{resource.reference}</h3>
                                <blockquote className="border-l-4 border-primary/30 pl-4 italic">
                                    {resource.content}
                                </blockquote>
                            </div>
                        </div>
                    </div>
                );

            case 'poll':
                const pollVotes = contextPollResults[resource.id] || {};
                const totalVotes = Object.values(pollVotes).reduce((sum: number, count: number) => sum + count, 0);

                return (
                    <div className="space-y-4 p-4 bg-blue-900/20 backdrop-blur rounded-lg border border-blue-500/30">
                        <div className="flex items-start gap-3">
                            <BarChart2 className="h-6 w-6 text-primary shrink-0 mt-1" />
                            <div className="space-y-4 flex-1">
                                <h3 className="text-lg font-medium">{resource.content}</h3>

                                <div className="space-y-3">
                                    {(resource.options || []).map((option: string) => {
                                        const voteCount = pollVotes[option] || 0;
                                        const percentage = totalVotes ? Math.round((voteCount / totalVotes) * 100) : 0;

                                        return (
                                            <div key={option} className="space-y-2">
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full justify-start",
                                                        selectedPollOption === option && "bg-primary/10"
                                                    )}
                                                    onClick={() => handleVotePoll(resource.id, option)}
                                                    disabled={selectedPollOption !== null}
                                                >
                                                    <div className="flex items-center gap-2 w-full">
                                                        <div className={cn(
                                                            "w-4 h-4 rounded-full border-2",
                                                            selectedPollOption === option
                                                                ? "border-primary bg-primary"
                                                                : "border-primary"
                                                        )} />
                                                        <span className="flex-1 text-left">{option}</span>
                                                        {selectedPollOption && (
                                                            <span className="text-sm text-muted-foreground">
                                                                {percentage}%
                                                            </span>
                                                        )}
                                                    </div>
                                                </Button>

                                                {selectedPollOption && (
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${percentage}%` }}
                                                        className="h-1 bg-primary rounded-full"
                                                        transition={{ duration: 1, ease: "easeOut" }}
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {selectedPollOption && totalVotes > 0 && (
                                    <p className="text-sm text-muted-foreground text-center">
                                        Total de votos: {totalVotes}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                );

            default:
                return <></>;
        }
    };

    const renderParticipantsList = (): JSX.Element => (
        <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed inset-y-0 right-0 w-80 bg-gray-900/95 backdrop-blur border-l border-white/10 shadow-lg p-4 overflow-y-auto z-50"
        >
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        <h3 className="font-medium text-lg">Participantes</h3>
                        <span className="text-sm text-muted-foreground">
                            ({participants.length})
                        </span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowParticipants(false)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="divide-y">
                    {handRaises.length > 0 && (
                        <div className="pb-4">
                            <h4 className="font-medium text-sm text-primary mb-2 flex items-center gap-2">
                                <Hand className="h-4 w-4" />
                                Mãos Levantadas
                            </h4>
                            {handRaises.map(hand => (
                                <motion.div
                                    key={hand.userId}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center justify-between py-2 px-3 bg-primary/5 rounded-md"
                                >
                                    <span className="font-medium text-primary">
                                        {hand.userName}
                                    </span>
                                    {isTeacher && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-primary hover:text-primary/80"
                                            onClick={() => giveVoice(hand.userId)}
                                        >
                                            Dar a palavra
                                        </Button>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {participants.map(participant => (
                        <motion.div
                            key={participant.userId}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="py-3 flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-sm font-medium text-primary">
                                        {participant.userName.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-medium">
                                        {participant.userName}
                                    </span>
                                    {participant.isGuest && (
                                        <span className="text-xs text-muted-foreground ml-2">
                                            (Visitante)
                                        </span>
                                    )}
                                </div>
                            </div>
                            {handRaises.find(h => h.userId === participant.userId) && (
                                <Hand className="h-4 w-4 text-primary" />
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
    const renderTopBar = (): JSX.Element => (
        <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={cn(
                "fixed top-0 left-0 right-0 z-50",
                "bg-gray-900/80 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60",
                "border-b border-white/10 shadow-sm"
            )}
        >
            <div className="max-w-7xl mx-auto p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button
                            variant={raisedHand ? "default" : "outline"}
                            size="sm"
                            onClick={handleRaiseHand}
                            className={cn(
                                "hidden sm:flex transition-all",
                                raisedHand && "bg-primary text-primary-foreground"
                            )}
                        >
                            <Hand className={cn(
                                "h-4 w-4 mr-2",
                                raisedHand && "animate-pulse"
                            )} />
                            {raisedHand ? 'Baixar Mão' : 'Levantar Mão'}
                        </Button>

                        <Button
                            variant={liked ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                                setLiked(!liked);
                                setReactionCount((prev: number) => liked ? prev - 1 : prev + 1);
                            }}
                            className={cn(
                                "hidden sm:flex",
                                liked && "bg-pink-500 border-pink-500 hover:bg-pink-600"
                            )}
                        >
                            <Heart className={cn(
                                "h-4 w-4 mr-2 transition-transform",
                                liked && "fill-white text-white scale-110"
                            )} />
                            {reactionCount > 0 && reactionCount}
                        </Button>

                        <Button
                            variant={isSync ? "default" : "outline"}
                            size="sm"
                            onClick={() => setIsSync(!isSync)}
                            className={cn(
                                "hidden sm:flex",
                                isSync && "bg-primary text-primary-foreground"
                            )}
                        >
                            {isSync ? (
                                <>
                                    <Wifi className="h-4 w-4 mr-2" />
                                    Sincronizado
                                </>
                            ) : (
                                <>
                                    <WifiOff className="h-4 w-4 mr-2" />
                                    Sincronizar
                                </>
                            )}
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            className="sm:hidden"
                            onClick={() => setIsMobileMenuOpen((prev: boolean) => !prev)}
                        >
                            <MessageCircle className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowParticipants((prev: boolean) => !prev)}
                            className={cn(
                                "hidden sm:flex items-center gap-2",
                                showParticipants && "bg-primary/10"
                            )}
                        >
                            <div className="flex items-center gap-1">
                                <Users className="h-4 w-4 text-primary" />
                                <span className="font-medium">{participants.length}</span>
                            </div>
                            {handRaises.length > 0 && (
                                <div className="flex items-center gap-1 text-primary">
                                    <Hand className="h-4 w-4" />
                                    <span className="font-medium">{handRaises.length}</span>
                                </div>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Barra de progresso */}
                <div className="h-1 bg-muted w-full mt-4">
                    <motion.div
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{
                            width: `${((currentSlide + 1) / (lesson.slides.length + 2)) * 100}%`
                        }}
                        transition={{ duration: 0.3 }}
                    />
                </div>

                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="sm:hidden mt-4 space-y-2"
                        >
                            {/* Menu mobile - controles */}
                            <Button
                                variant={raisedHand ? "default" : "outline"}
                                size="sm"
                                onClick={handleRaiseHand}
                                className="w-full justify-start"
                            >
                                <Hand className="h-4 w-4 mr-2" />
                                {raisedHand ? 'Baixar Mão' : 'Levantar Mão'}
                            </Button>

                            <Button
                                variant={liked ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                    setLiked(!liked);
                                    setReactionCount((prev: number) => liked ? prev - 1 : prev + 1);
                                }}
                                className="w-full justify-start"
                            >
                                <Heart className={cn(
                                    "h-4 w-4 mr-2",
                                    liked && "fill-primary"
                                )} />
                                {reactionCount > 0 ? `${reactionCount} curtidas` : 'Curtir'}
                            </Button>

                            <Button
                                variant={isSync ? "default" : "outline"}
                                size="sm"
                                onClick={() => setIsSync(!isSync)}
                                className="w-full justify-start"
                            >
                                {isSync ? (
                                    <>
                                        <Wifi className="h-4 w-4 mr-2" />
                                        Sincronizado
                                    </>
                                ) : (
                                    <>
                                        <WifiOff className="h-4 w-4 mr-2" />
                                        Sincronizar
                                    </>
                                )}
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowParticipants((prev: boolean) => !prev)}
                                className="w-full justify-start"
                            >
                                <Users className="h-4 w-4 mr-2" />
                                {participants.length} participantes
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
    const renderSlideContent = (slide: Slide): JSX.Element => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-3xl mx-auto relative"
        >
            <div className="relative group">
                <blockquote className="text-3xl leading-relaxed font-serif text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                    {slide.content}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -right-12 top-0 opacity-0 group-hover:opacity-100 transition-opacity text-white"
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
                </blockquote>
            </div>

            {slide.resources?.map((resource, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="mt-8"
                >
                    {renderResource(resource)}
                </motion.div>
            ))}

            {showNoteInput ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8"
                >
                    <div className="space-y-2">
                        <Input
                            value={personalNote}
                            onChange={(e) => setPersonalNote(e.target.value)}
                            placeholder="Digite sua nota pessoal..."
                            className="w-full bg-background/50"
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
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8"
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

    const renderClosingSlide = (): JSX.Element => (
        <motion.div
            className="p-8 sm:p-12"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={fadeIn}
        >
            <motion.div
                className="text-center space-y-8"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-br from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Encerramento
                </h1>
                <p className="text-lg text-muted-foreground">
                    Obrigado por participar da lição de hoje!
                </p>
            </motion.div>
        </motion.div>
    );

    const renderWelcomeSlide = (): JSX.Element => (
        <motion.div
            className="p-8 sm:p-12"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={fadeIn}
        >
            <motion.div
                className="text-center space-y-8"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-br from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {lesson.title}
                </h1>

                <div className="max-w-2xl mx-auto space-y-12">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-medium">Hino de Abertura</h2>
                        <a
                            href={lesson.firstHymn}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                        >
                            {lesson.firstHymn}
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-medium">Primeira Oração</h2>
                        <p className="text-lg text-muted-foreground">{lesson.firstPrayer}</p>
                    </div>

                    {lesson.announcements && (
                        <div className="pt-8 border-t">
                            <h2 className="text-2xl font-medium mb-4">Anúncios</h2>
                            <p className="text-lg text-muted-foreground whitespace-pre-wrap">
                                {lesson.announcements}
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent): void => {
            if (e.key === 'ArrowLeft') {
                setCurrentSlide(Math.max(0, currentSlide - 1));
            } else if (e.key === 'ArrowRight') {
                setCurrentSlide(Math.min(lesson.slides.length + 1, currentSlide + 1));
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [lesson.slides.length]);

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900">
            <CurrentLessonBar
                enrolledClasses={enrolledClasses}
                fallbackMessage="Selecione uma aula para começar."
            />
            {/* Efeito de partículas de fundo */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.1),rgba(14,165,233,0)_50%)] animate-pulse" />
            </div>

            {renderTopBar()}

            <AnimatePresence>
                {showParticipants && renderParticipantsList()}
            </AnimatePresence>

            <main className="pt-16 pb-16">
                <div className="max-w-6xl mx-auto px-2">
                    <Card className="overflow-hidden group bg-gray-900/90 backdrop-blur border-white/10">
                        <CardContent className="grid grid-cols-[auto_1fr_auto] gap-2 items-center min-h-[500px]">
                            <div className="pl-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <NavButton
                                    direction="prev"
                                    onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                                    disabled={currentSlide === 0}
                                    showLabel
                                />
                            </div>

                            <div className="w-full px-8 py-8">
                                <AnimatePresence mode="wait">
                                    {currentSlide === 0 ? (
                                        renderWelcomeSlide()
                                    ) : currentSlide === lesson.slides.length + 1 ? (
                                        renderClosingSlide()
                                    ) : (
                                        renderSlideContent(lesson.slides[currentSlide - 1])
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <NavButton
                                    direction="next"
                                    onClick={() => setCurrentSlide(Math.min(lesson.slides.length + 1, currentSlide + 1))}
                                    disabled={currentSlide === lesson.slides.length + 1}
                                    showLabel
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}