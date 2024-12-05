'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card/card';
import { Input } from '@/components/ui/input/input';
import { Button } from '@/components/ui/button/button';
import { Textarea } from '@/components/ui/textarea/textarea';
import { useRouter } from 'next/navigation';
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
    ArrowRight
} from 'lucide-react';
import HymnSelector from './HymnSelector';
import DiscourseSelector from './DiscourseSelector';
import { QuestionDialog } from './content-types/QuestionDialog';
import { ScriptureDialog } from './content-types/ScriptureDialog';
import { PollDialog } from './content-types/PollDialog';
import { processDiscourseContent } from '@/utils/discourse-utils';

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
        slides: []
    });

    const [slideStatuses, setSlideStatuses] = useState<Record<number, {
        confirmed: boolean;
        rejected: boolean;
    }>>({});

    const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 } };

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

    const handleConfirmSlide = (index: number) => {
        setSlideStatuses(prev => ({
            ...prev,
            [index]: { confirmed: true, rejected: false }
        }));

        // Automaticamente mostra os botões de recursos
        setCurrentSlide(index);
    };

    const handleRejectSlide = (index: number) => {
        setSlideStatuses(prev => ({
            ...prev,
            [index]: { confirmed: false, rejected: true }
        }));

        // Automaticamente avança para o próximo slide
        if (index < formData.slides.length - 1) {
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

            // Estrutura os dados conforme esperado pelo backend
            const requestData = {
                title: formData.title,
                firstHymn: formData.firstHymn,
                firstPrayer: formData.firstPrayer,
                announcements: formData.announcements || "",
                lastHymn: formData.lastHymn,
                lastPrayer: formData.lastPrayer,
                discourse: formData.discourse,
                wardId: user?.ward?.id,
                classId: classId,  // Usando o classId recebido via props
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

            // Debug log
            console.log('Dados enviados:', requestData);

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
                console.error('Resposta de erro:', errorData);
                throw new Error(errorData.error || 'Erro ao salvar aula');
            }

            const data = await response.json();
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
                            <label className="text-sm font-medium">Discurso da Conferência</label>
                            <DiscourseSelector
                                value={formData.discourse}
                                onChange={handleDiscourseChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Primeiro Hino</label>
                            <HymnSelector
                                value={formData.firstHymn}
                                onChange={handleHymnChange('firstHymn')}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Primeira Oração</label>
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
                            <label className="text-sm font-medium">Último Hino</label>
                            <HymnSelector
                                value={formData.lastHymn}
                                onChange={handleHymnChange('lastHymn')}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Última Oração</label>
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
                            <label className="text-sm font-medium">Anúncios (opcional)</label>
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

    const renderStepTwo = () => (
        <motion.div initial="initial" animate="animate" exit="exit" variants={fadeIn} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{lessonTitle}</CardTitle>
                    <CardDescription>Sua apresentação está pronta</CardDescription>
                    <CardDescription>
                        Sua apresentação está pronta! Agora você pode personalizar cada slide:
                        selecione os que deseja manter e adicione recursos como escrituras,
                        perguntas e enquetes para tornar sua aula mais interativa.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <Card className="relative">
                            <CardContent className="p-6">
                                <div className="absolute right-4 top-4 flex gap-2">
                                    {!slideStatuses[currentSlide]?.rejected && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 w-10 hover:bg-accent hover:text-accent-foreground p-0 text-green-600 hover:text-green-700 hover:bg-green-50`}
                                            onClick={() => handleConfirmSlide(currentSlide)}
                                        >
                                            <Check className={`h-5 w-5 ${slideStatuses[currentSlide]?.confirmed ? 'text-green-600' : ''}`} />
                                        </motion.button>
                                    )}
                                    {!slideStatuses[currentSlide]?.confirmed && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 w-10 hover:bg-accent hover:text-accent-foreground p-0 text-red-600 hover:text-red-700 hover:bg-red-50`}
                                            onClick={() => handleRejectSlide(currentSlide)}
                                        >
                                            <X className={`h-5 w-5 ${slideStatuses[currentSlide]?.rejected ? 'text-red-600' : ''}`} />
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

                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentSlide}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className={`prose dark:prose-invert max-w-none ${slideStatuses[currentSlide]?.rejected ? 'opacity-50' : ''}`}
                                    >
                                        <p className="whitespace-pre-wrap">{formData.slides[currentSlide].content}</p>
                                    </motion.div>
                                </AnimatePresence>

                                {(slideStatuses[currentSlide]?.confirmed || !slideStatuses[currentSlide]) && (
                                    <>
                                        <div className="flex flex-wrap items-center gap-2 border-t pt-4 mt-4">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 flex-1 sm:flex-none"
                                                onClick={() => handleAddResource('question')}
                                            >
                                                <HelpCircle className="h-4 w-4 mr-2" />
                                                Adicionar Pergunta
                                            </motion.button>

                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 flex-1 sm:flex-none"
                                                onClick={() => handleAddResource('scripture')}
                                            >
                                                <Book className="h-4 w-4 mr-2" />
                                                Adicionar Escritura
                                            </motion.button>

                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 flex-1 sm:flex-none"
                                                onClick={() => handleAddResource('poll')}
                                            >
                                                <BarChart2 className="h-4 w-4 mr-2" />
                                                Adicionar Enquete
                                            </motion.button>
                                        </div>

                                        {formData.slides[currentSlide].resources?.map((resource, resourceIndex) => (
                                            <motion.div
                                                key={resourceIndex}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mt-4 border-t pt-4"
                                            >
                                                {/* ... resto do conteúdo dos recursos permanece igual ... */}
                                            </motion.div>
                                        ))}
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        <div className="flex justify-between items-center">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 ${currentSlide === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                                disabled={currentSlide === 0}
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Anterior
                            </motion.button>

                            <div className="text-sm text-muted-foreground">
                                <div className="text-center">
                                    Slide {currentSlide + 1} de {formData.slides.length}
                                </div>
                                <div className="text-xs">
                                    {getActiveSlides().length} slides selecionados
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:accent-foreground h-10 px-4 py-2 ${currentSlide === formData.slides.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => setCurrentSlide(prev => Math.min(formData.slides.length - 1, prev + 1))}
                                disabled={currentSlide === formData.slides.length - 1}
                            >
                                Próximo
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </motion.button>
                        </div>

                        <div className="flex justify-between pt-6">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                                onClick={() => setStep(1)}
                                disabled={isLoading}
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Voltar
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
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
                            </motion.button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <QuestionDialog
                open={questionDialogOpen}
                onOpenChange={setQuestionDialogOpen}
                onSave={(data) => handleResourceSave(data, 'question')}
            />

            <ScriptureDialog
                open={scriptureDialogOpen}
                onOpenChange={setScriptureDialogOpen}
                onSave={(data) => handleResourceSave(data, 'scripture')}
            />

            <PollDialog
                open={pollDialogOpen}
                onOpenChange={setPollDialogOpen}
                onSave={(data) => handleResourceSave(data, 'poll')}
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