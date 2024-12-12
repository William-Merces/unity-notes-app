// src/components/lesson/LessonForm.tsx

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card/card';
import { Input } from '@/components/ui/input/input';
import { Button } from '@/components/ui/button/button';
import { Textarea } from '@/components/ui/textarea/textarea';
import { useRouter } from 'next/navigation';
import cn from 'classnames';
import { useAuth } from '@/contexts/AuthContext';
import {
    Loader2,
    ChevronRight,
    ChevronLeft,
    Check,
    X,
    Book,
    HelpCircle,
    BarChart2,
    Lightbulb,
    PlusCircle,
    ArrowRight,
    Calendar
} from 'lucide-react';
import HymnSelector from './HymnSelector';
import DiscourseSelector from './DiscourseSelector';
import { QuestionDialog } from './content-types/QuestionDialog';
import { ScriptureDialog } from './content-types/ScriptureDialog';
import { PollDialog } from './content-types/PollDialog';
import { processDiscourseContent } from '@/utils/discourse-utils';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group/radio-group";
import { Label } from "@/components/ui/label/label";

interface FormData {
    firstHymn: string;
    firstPrayer: string;
    announcements: string;
    lastHymn: string;
    lastPrayer: string;
    discourse: string;
    title: string;
    wardId: string;
    speaker: string;
    classId: string;
    lessonDate: Date;
    slides: Array<{
        content: string;
        resources: any[];
    }>;
}

const LessonForm = ({ classId }: { classId: string }) => {
    const { user } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
    const [scriptureDialogOpen, setScriptureDialogOpen] = useState(false);
    const [pollDialogOpen, setPollDialogOpen] = useState(false);
    const [lessonTitle, setLessonTitle] = useState<string>('');
    const [autoAdvance, setAutoAdvance] = useState(true);
    const [showPreview, setShowPreview] = useState(false);

    const [formData, setFormData] = useState<FormData>({
        firstHymn: '',
        firstPrayer: '',
        announcements: '',
        lastHymn: '',
        lastPrayer: '',
        discourse: '',
        title: '',
        wardId: '',
        speaker: '',
        classId: classId,
        lessonDate: getNextSunday(),
        slides: []
    });

    function getNextSunday(from: Date = new Date()): Date {
        const date = new Date(from);
        date.setDate(date.getDate() + (7 - date.getDay()));
        return date;
    }

    const [slideStatuses, setSlideStatuses] = useState<Record<number, {
        confirmed: boolean;
        rejected: boolean;
    }>>({});

    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 }
    };

    const handleHymnChange = (type: 'firstHymn' | 'lastHymn') => (hymn: { url: string }) => {
        setFormData(prev => ({
            ...prev,
            [type]: hymn.url
        }));
    };

    const handleDiscourseChange = (discourse: { url: string; title: string; speaker: string }) => {
        setFormData(prev => ({
            ...prev,
            discourse: discourse.url,
            title: discourse.title,
            speaker: discourse.speaker,
            slides: []
        }));
        setLessonTitle(discourse.title);
        setSlideStatuses({});
    };

    const handleGenerateSlides = async () => {
        if (!formData.discourse) {
            setError('Selecione um discurso primeiro');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/discourse?url=${encodeURIComponent(formData.discourse)}`);
            if (!response.ok) {
                throw new Error('Erro ao carregar discurso');
            }

            const html = await response.text();
            const slides = processDiscourseContent(html);

            if (slides.length === 0) {
                throw new Error('Nenhum conteúdo encontrado no discurso');
            }

            setFormData(prev => ({
                ...prev,
                slides
            }));

            setStep(2);
        } catch (error) {
            console.error('Erro ao gerar slides:', error);
            setError('Erro ao gerar apresentação. Por favor, tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSlideAction = (index: number, action: 'confirm' | 'reject') => {
        setSlideStatuses(prev => ({
            ...prev,
            [index]: { 
                confirmed: action === 'confirm', 
                rejected: action === 'reject' 
            }
        }));

        if (autoAdvance && index < formData.slides.length - 1) {
            setCurrentSlide(index + 1);
        }
    };

    const handleResetSlideStatus = (index: number) => {
        setSlideStatuses(prev => {
            const newStatuses = { ...prev };
            delete newStatuses[index];
            return newStatuses;
        });
    };

    const handleAddResource = (type: 'question' | 'scripture' | 'poll') => {
        switch (type) {
            case 'question':
                setQuestionDialogOpen(true);
                break;
            case 'scripture':
                setScriptureDialogOpen(true);
                break;
            case 'poll':
                setPollDialogOpen(true);
                break;
        }
    };

    const handleResourceSave = (data: any, type: 'question' | 'scripture' | 'poll') => {
        const newResource = { type, ...data };

        setFormData(prev => ({
            ...prev,
            slides: prev.slides.map((slide, i) =>
                i === currentSlide
                    ? {
                        ...slide,
                        resources: [...(slide.resources || []), newResource]
                    }
                    : slide
            )
        }));
    };

    const getActiveSlides = () => {
        return formData.slides.filter((_, index) =>
            !slideStatuses[index]?.rejected &&
            (slideStatuses[index]?.confirmed || !slideStatuses[index])
        );
    };

    const validateForm = () => {
        if (!formData.firstHymn) return 'Selecione o primeiro hino';
        if (!formData.firstPrayer) return 'Digite o nome de quem fará a primeira oração';
        if (!formData.lastHymn) return 'Selecione o último hino';
        if (!formData.lastPrayer) return 'Digite o nome de quem fará a última oração';
        if (!formData.discourse) return 'Selecione um discurso';
        if (!user?.ward?.id) return 'Usuário não está associado a uma ala';
        if (formData.slides.length === 0) return 'Gere o conteúdo do discurso primeiro';
        return null;
    };

    const handleDateChange = (newDate: Date) => {
        setFormData(prev => ({
            ...prev,
            lessonDate: newDate
        }));
    };

    const handleSubmit = async () => {
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const activeSlides = getActiveSlides();

            const requestData = {
                title: formData.title,
                firstHymn: formData.firstHymn,
                firstPrayer: formData.firstPrayer,
                announcements: formData.announcements || "",
                lastHymn: formData.lastHymn,
                lastPrayer: formData.lastPrayer,
                discourse: formData.discourse,
                wardId: user?.ward?.id,
                classId: classId,
                lessonDate: formData.lessonDate.toISOString(),
                slides: activeSlides.map((slide, index) => ({
                    content: slide.content,
                    order: index,
                    resources: Array.isArray(slide.resources) ? slide.resources.map(resource => ({
                        type: resource.type,
                        content: resource.content || null,
                        reference: resource.reference || null,
                        options: Array.isArray(resource.options) ? resource.options : null
                    })) : []
                }))
            };

            const response = await fetch('/api/lessons', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao salvar aula');
            }

            const data: { id: string } = await response.json();
            router.push(`/ver-aula?id=${data.id}`);
        } catch (error) {
            console.error('Erro detalhado:', error);
            setError(
                error instanceof Error
                    ? error.message
                    : 'Erro ao salvar aula'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const renderStepOne = () => (
        <motion.div initial="initial" animate="animate" exit="exit" variants={fadeIn}>
            <Card>
                <CardHeader>
                    <CardTitle>{lessonTitle || 'Nova Aula'}</CardTitle>
                    <CardDescription>
                        Vamos começar configurando as informações básicas da aula
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Data da Aula</Label>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="date"
                                    value={formData.lessonDate.toISOString().split('T')[0]}
                                    onChange={(e) => handleDateChange(new Date(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Discurso da Conferência</Label>
                            <DiscourseSelector
                                value={formData.discourse}
                                onChange={handleDiscourseChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Primeiro Hino</Label>
                            <HymnSelector
                                value={formData.firstHymn}
                                onChange={handleHymnChange('firstHymn')}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Primeira Oração</Label>
                            <Input
                                value={formData.firstPrayer}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    firstPrayer: e.target.value
                                }))}
                                placeholder="Nome de quem fará a primeira oração"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Último Hino</Label>
                            <HymnSelector
                                value={formData.lastHymn}
                                onChange={handleHymnChange('lastHymn')}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Última Oração</Label>
                            <Input
                                value={formData.lastPrayer}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    lastPrayer: e.target.value
                                }))}
                                placeholder="Nome de quem fará a última oração"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Anúncios (opcional)</Label>
                            <Textarea
                                value={formData.announcements}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    announcements: e.target.value
                                }))}
                                placeholder="Anúncios para compartilhar na aula"
                            />
                        </div>
                    </div>

                    <div className="pt-6 flex justify-end">
                        <Button
                            onClick={handleGenerateSlides}
                            disabled={!formData.discourse || !formData.firstHymn || !formData.firstPrayer || !formData.lastHymn || !formData.lastPrayer || isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Gerando apresentação...
                                </>
                            ) : (
                                <>
                                    Gerar Apresentação
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );

    const renderResource = (resource: any) => {
        switch (resource.type) {
            case 'question':
                return <div>Question: {resource.content}</div>;
            case 'scripture':
                return <div>Scripture: {resource.reference}</div>;
            case 'poll':
                return <div>Poll: {resource.question}</div>;
            default:
                return null;
        }
    };
    
    const renderStepTwo = () => (
        <motion.div initial="initial" animate="animate" exit="exit" variants={fadeIn} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{lessonTitle}</CardTitle>
                    <CardDescription className="space-y-4">
                        <p>
                            Sua apresentação está pronta! Avance pelos slides usando as setas ou 
                            as teclas do teclado. Selecione os slides que deseja manter e 
                            adicione recursos interativos.
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="autoAdvance"
                                    checked={autoAdvance}
                                    onChange={(e) => setAutoAdvance(e.target.checked)}
                                    className="rounded border-gray-300"
                                />
                                <Label htmlFor="autoAdvance">Avançar automaticamente</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="showPreview"
                                    checked={showPreview}
                                    onChange={(e) => setShowPreview(e.target.checked)}
                                    className="rounded border-gray-300"
                                />
                                <Label htmlFor="showPreview">Mostrar preview</Label>
                            </div>
                        </div>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <Card className="relative overflow-hidden">
                            <CardContent className="p-6">
                                <div className="absolute right-4 top-4 flex gap-2 z-10">
                                    {!slideStatuses[currentSlide]?.rejected && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={cn(
                                                "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 w-10 hover:bg-accent hover:text-accent-foreground p-0",
                                                "text-green-600 hover:text-green-700 hover:bg-green-50"
                                            )}
                                            onClick={() => handleSlideAction(currentSlide, 'confirm')}
                                        >
                                            <Check className={cn(
                                                "h-5 w-5",
                                                slideStatuses[currentSlide]?.confirmed && "text-green-600"
                                            )} />
                                        </motion.button>
                                    )}
                                    {!slideStatuses[currentSlide]?.confirmed && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={cn(
                                                "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 w-10 hover:bg-accent hover:text-accent-foreground p-0",
                                                "text-red-600 hover:text-red-700 hover:bg-red-50"
                                            )}
                                            onClick={() => handleSlideAction(currentSlide, 'reject')}
                                        >
                                            <X className={cn(
                                                "h-5 w-5",
                                                slideStatuses[currentSlide]?.rejected && "text-red-600"
                                            )} />
                                        </motion.button>
                                    )}
                                    {(slideStatuses[currentSlide]?.confirmed || slideStatuses[currentSlide]?.rejected) && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 w-10 hover:bg-accent hover:text-accent-foreground p-0"
                                            onClick={() => handleResetSlideStatus(currentSlide)}
                                        >
                                            <ArrowRight className="h-5 w-5" />
                                        </motion.button>
                                    )}
                                </div>

                                <div className={cn(
                                    "transition-opacity duration-200",
                                    slideStatuses[currentSlide]?.rejected && "opacity-50"
                                )}>
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={currentSlide}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="prose dark:prose-invert max-w-none"
                                        >
                                            <div className="relative">
                                                {showPreview ? (
                                                    <div className="grid grid-cols-2 gap-6">
                                                        <div className="space-y-4">
                                                            <h3 className="text-sm font-medium text-muted-foreground">Editor</h3>
                                                            <p className="whitespace-pre-wrap">{formData.slides[currentSlide].content}</p>
                                                        </div>
                                                        <div className="space-y-4">
                                                            <h3 className="text-sm font-medium text-muted-foreground">Preview</h3>
                                                            <div className="p-6 rounded-lg bg-accent/50">
                                                                <p className="text-xl font-serif leading-relaxed">
                                                                    {formData.slides[currentSlide].content}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="whitespace-pre-wrap">
                                                        {formData.slides[currentSlide].content}
                                                    </p>
                                                )}
                                            </div>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>

                                {(slideStatuses[currentSlide]?.confirmed || !slideStatuses[currentSlide]) && (
                                    <>
                                        <div className="flex flex-wrap items-center gap-2 border-t pt-4 mt-4">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleAddResource('question')}
                                                className="flex-1 sm:flex-none"
                                            >
                                                <HelpCircle className="h-4 w-4 mr-2" />
                                                Adicionar Pergunta
                                            </Button>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleAddResource('scripture')}
                                                className="flex-1 sm:flex-none"
                                            >
                                                <Book className="h-4 w-4 mr-2" />
                                                Adicionar Escritura
                                            </Button>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleAddResource('poll')}
                                                className="flex-1 sm:flex-none"
                                            >
                                                <BarChart2 className="h-4 w-4 mr-2" />
                                                Adicionar Enquete
                                            </Button>
                                        </div>

                                        {formData.slides[currentSlide].resources?.map((resource, resourceIndex) => (
                                            <motion.div
                                                key={resourceIndex}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mt-4 border-t pt-4"
                                            >
                                                {renderResource(resource)}
                                            </motion.div>
                                        ))}
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        <div className="flex justify-between items-center">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                                disabled={currentSlide === 0}
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Anterior
                            </Button>

                            <div className="text-center">
                                <div className="text-sm font-medium">
                                    Slide {currentSlide + 1} de {formData.slides.length}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {getActiveSlides().length} slides selecionados
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentSlide(prev => Math.min(formData.slides.length - 1, prev + 1))}
                                disabled={currentSlide === formData.slides.length - 1}
                            >
                                Próximo
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>

                        <div className="flex justify-between pt-6">
                            <Button
                                variant="outline"
                                onClick={() => setStep(1)}
                                disabled={isLoading}
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Voltar
                            </Button>

                            <Button
                                variant="default"
                                onClick={handleSubmit}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    'Finalizar Aula'
                                )}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <QuestionDialog
                open={questionDialogOpen}
                onOpenChange={setQuestionDialogOpen}
                onSave={(data) => handleResourceSave(data, 'question')}
                content=""
                suggestions={[]}
            />

            <ScriptureDialog
                open={scriptureDialogOpen}
                onOpenChange={setScriptureDialogOpen}
                onSave={(data) => handleResourceSave(data, 'scripture')}
                reference=""
                content=""
            />

            <PollDialog
                open={pollDialogOpen}
                onOpenChange={setPollDialogOpen}
                onSave={(data) => handleResourceSave(data, 'poll')}
                question=""
                options={[]}
            />
        </motion.div>
    );

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            <AnimatePresence mode="wait">
                {step === 1 && renderStepOne()}
                {step === 2 && renderStepTwo()}
            </AnimatePresence>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 p-4 bg-destructive/10 text-destructive rounded-md"
                >
                    {error}
                </motion.div>
            )}
        </div>
    );
};

export default LessonForm;
