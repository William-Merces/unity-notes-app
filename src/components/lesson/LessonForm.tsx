'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card/card';
import { Input } from '@/components/ui/input/input';
import { Button } from '@/components/ui/button/button';
import { Textarea } from '@/components/ui/textarea/textarea';
import {
    X,
    HelpCircle,
    Book,
    BarChart2,
    Trash2,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Check,
    XCircle,
    CheckCircle
} from 'lucide-react';
import HymnSelector from './HymnSelector';
import DiscourseSelector from './DiscourseSelector';
import { QuestionDialog } from './content-types/QuestionDialog';
import { ScriptureDialog } from './content-types/ScriptureDialog';
import { PollDialog } from './content-types/PollDialog';
import { useRouter } from 'next/navigation';
import { processDiscourseContent } from '@/utils/discourse-utils';

interface SlideStatus {
    confirmed: boolean;
    rejected: boolean;
}

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

interface FormData {
    firstHymn: string;
    firstPrayer: string;
    announcements: string;
    lastHymn: string;
    lastPrayer: string;
    discourse: string;
    slides: Slide[];
}

const LessonForm = () => {
    const router = useRouter();
    const [formData, setFormData] = useState<FormData>({
        firstHymn: '',
        firstPrayer: '',
        announcements: '',
        lastHymn: '',
        lastPrayer: '',
        discourse: '',
        slides: []
    });

    const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
    const [scriptureDialogOpen, setScriptureDialogOpen] = useState(false);
    const [pollDialogOpen, setPollDialogOpen] = useState(false);
    const [activeSlideIndex, setActiveSlideIndex] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isLoadingDiscourse, setIsLoadingDiscourse] = useState(false);
    const [currentPreviewSlide, setCurrentPreviewSlide] = useState(0);
    const [slideStatuses, setSlideStatuses] = useState<Record<number, SlideStatus>>({});

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleHymnChange = (type: 'firstHymn' | 'lastHymn') => (hymn: { url: string }) => {
        setFormData(prev => ({
            ...prev,
            [type]: hymn.url
        }));
    };

    const handleDiscourseChange = (discourse: { url: string }) => {
        setFormData(prev => ({
            ...prev,
            discourse: discourse.url,
            slides: []
        }));
    };

    const handleLoadDiscourse = async () => {
        if (!formData.discourse) return;

        setIsLoadingDiscourse(true);
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
        } catch (error) {
            console.error('Erro ao carregar discurso:', error);
            window.alert('Erro ao carregar o discurso. Tente novamente.');
        } finally {
            setIsLoadingDiscourse(false);
        }
    };

    const handleConfirmSlide = (index: number) => {
        setSlideStatuses(prev => ({
            ...prev,
            [index]: { confirmed: true, rejected: false }
        }));
    };

    const handleRejectSlide = (index: number) => {
        setSlideStatuses(prev => ({
            ...prev,
            [index]: { confirmed: false, rejected: true }
        }));
    };

    const handleResetSlideStatus = (index: number) => {
        setSlideStatuses(prev => {
            const newStatuses = { ...prev };
            delete newStatuses[index];
            return newStatuses;
        });
    };

    const getActiveSlides = () => {
        return formData.slides.filter((_, index) =>
            !slideStatuses[index]?.rejected &&
            (slideStatuses[index]?.confirmed || !slideStatuses[index])
        );
    };

    const handleAddResource = (type: 'question' | 'scripture' | 'poll') => {
        setActiveSlideIndex(currentPreviewSlide);
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
        if (activeSlideIndex === null) return;

        const newResource: Resource = {
            type,
            ...data
        };

        setFormData(prev => ({
            ...prev,
            slides: prev.slides.map((slide, i) =>
                i === activeSlideIndex
                    ? {
                        ...slide,
                        resources: [...(slide.resources || []), newResource]
                    }
                    : slide
            )
        }));
    };

    const handleRemoveResource = (slideIndex: number, resourceIndex: number) => {
        setFormData(prev => ({
            ...prev,
            slides: prev.slides.map((slide, i) =>
                i === slideIndex
                    ? {
                        ...slide,
                        resources: slide.resources.filter((_, j) => j !== resourceIndex)
                    }
                    : slide
            )
        }));
    };

    const validateForm = () => {
        if (!formData.firstHymn) return 'Selecione o primeiro hino';
        if (!formData.firstPrayer) return 'Digite o nome de quem fará a primeira oração';
        if (!formData.lastHymn) return 'Selecione o último hino';
        if (!formData.lastPrayer) return 'Digite o nome de quem fará a última oração';
        if (!formData.discourse) return 'Selecione um discurso';
        if (formData.slides.length === 0) return 'Carregue o conteúdo do discurso';
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationError = validateForm();
        if (validationError) {
            setSubmitError(validationError);
            return;
        }

        const activeSlides = getActiveSlides();

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const requestData = {
                ...formData,
                slides: activeSlides.map(slide => ({
                    ...slide,
                    resources: slide.resources.map(resource => ({
                        type: resource.type,
                        content: resource.content || resource.question || '',
                        reference: resource.reference || null,
                        options: resource.type === 'poll' 
                            ? JSON.stringify({options: resource.options})
                            : resource.type === 'question'
                                ? JSON.stringify({suggestions: resource.suggestions})
                                : null
                    }))
                }))
            };

            const response = await fetch('/api/lessons', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao salvar aula');
            }

            if (!data.id) {
                throw new Error('ID da aula não retornado');
            }

            router.push(`/ver-aula?id=${data.id}`);
        } catch (error) {
            console.error('Erro ao salvar:', error);
            setSubmitError(
                error instanceof Error
                    ? error.message
                    : 'Erro ao salvar aula'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            <form onSubmit={handleSubmit}>
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Início da Aula</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="firstHymn" className="text-sm font-medium">
                                Primeiro Hino
                            </label>
                            <HymnSelector
                                value={formData.firstHymn}
                                onChange={handleHymnChange('firstHymn')}
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="firstPrayer" className="text-sm font-medium">
                                Primeira Oração
                            </label>
                            <Input
                                id="firstPrayer"
                                name="firstPrayer"
                                value={formData.firstPrayer}
                                onChange={handleInputChange}
                                placeholder="Nome de quem vai orar"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="announcements" className="text-sm font-medium">
                                Anúncios
                            </label>
                            <Textarea
                                id="announcements"
                                name="announcements"
                                value={formData.announcements}
                                onChange={handleInputChange}
                                placeholder="Anúncios da aula"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Conteúdo</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Discurso Tema
                            </label>
                            <DiscourseSelector
                                value={formData.discourse}
                                onChange={handleDiscourseChange}
                            />

                            {formData.discourse && (
                                <div className="mt-6">
                                    <Button
                                        type="button"
                                        onClick={handleLoadDiscourse}
                                        disabled={isLoadingDiscourse}
                                    >
                                        {isLoadingDiscourse && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        {isLoadingDiscourse
                                            ? 'Carregando...'
                                            : 'Carregar Parágrafos do Discurso'
                                        }
                                    </Button>
                                </div>
                            )}
                        </div>

                        {formData.slides.length > 0 && (
                            <div className="mt-6 space-y-4">
                                <Card className="relative h-[500px] flex flex-col">
                                    <div className="absolute right-2 top-2 flex gap-2">
                                        {!slideStatuses[currentPreviewSlide]?.rejected && (
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="ghost"
                                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                onClick={() => handleConfirmSlide(currentPreviewSlide)}
                                            >
                                                <CheckCircle className={`h-5 w-5 ${slideStatuses[currentPreviewSlide]?.confirmed ? 'fill-green-600' : ''}`} />
                                            </Button>
                                        )}
                                        {!slideStatuses[currentPreviewSlide]?.confirmed && (
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="ghost"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleRejectSlide(currentPreviewSlide)}
                                            >
                                                <XCircle className={`h-5 w-5 ${slideStatuses[currentPreviewSlide]?.rejected ? 'fill-red-600' : ''}`} />
                                            </Button>
                                        )}
                                        {(slideStatuses[currentPreviewSlide]?.confirmed || slideStatuses[currentPreviewSlide]?.rejected) && (
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="ghost"
                                                className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                                                onClick={() => handleResetSlideStatus(currentPreviewSlide)}
                                            >
                                                <X className="h-5 w-5" />
                                            </Button>
                                        )}
                                    </div>

                                    <CardContent className="flex-1 overflow-y-auto p-6">
                                        <div className={`prose dark:prose-invert max-w-none ${slideStatuses[currentPreviewSlide]?.rejected ? 'opacity-50' : ''
                                            }`}>
                                            <p className="whitespace-pre-wrap">{formData.slides[currentPreviewSlide].content}</p>
                                        </div>

                                        {!slideStatuses[currentPreviewSlide]?.rejected && (
                                            <>
                                                <div className="flex items-center gap-2 border-t pt-4 mt-4">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleAddResource('question')}
                                                    >
                                                        <HelpCircle className="h-4 w-4 mr-2" />
                                                        Adicionar Pergunta
                                                    </Button>

                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleAddResource('scripture')}
                                                    >
                                                        <Book className="h-4 w-4 mr-2" />
                                                        Adicionar Escritura
                                                    </Button>

                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleAddResource('poll')}
                                                    >
                                                        <BarChart2 className="h-4 w-4 mr-2" />
                                                        Adicionar Enquete
                                                    </Button>
                                                </div>

                                                {formData.slides[currentPreviewSlide].resources?.map((resource, resourceIndex) => (
                                                    <div key={resourceIndex} className="mt-4 border-t pt-4">
                                                        {resource.type === 'question' && (
                                                            <div className="space-y-2">
                                                                <div className="flex items-center gap-2">
                                                                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                                                    <p className="font-medium">Pergunta:</p>
                                                                </div>
                                                                <p>{resource.content}</p>
                                                                {resource.suggestions && resource.suggestions.length > 0 && (
                                                                    <div className="pl-6 text-muted-foreground">
                                                                        <p className="text-sm font-medium mb-1">Sugestões de resposta:</p>
                                                                        <ul className="list-disc pl-4 space-y-1">
                                                                            {resource.suggestions.map((suggestion, i) => (
                                                                                <li key={i}>{suggestion}</li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {resource.type === 'scripture' && (
                                                            <div className="space-y-2">
                                                                <div className="flex items-center gap-2">
                                                                    <Book className="h-4 w-4 text-muted-foreground" />
                                                                    <p className="font-medium">Escritura:</p>
                                                                </div>
                                                                <div className="pl-6">
                                                                    <p className="font-medium">{resource.reference}</p>
                                                                    <p className="text-muted-foreground">{resource.content}</p>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {resource.type === 'poll' && (
                                                            <div className="space-y-2">
                                                                <div className="flex items-center gap-2">
                                                                    <BarChart2 className="h-4 w-4 text-muted-foreground" />
                                                                    <p className="font-medium">Enquete:</p>
                                                                </div>
                                                                <p>{resource.question}</p>
                                                                <div className="pl-6 space-y-1">
                                                                    {resource.options?.map((option, i) => (
                                                                        <div key={i} className="flex items-center gap-2">
                                                                            <span className="text-muted-foreground">{i + 1}.</span>
                                                                            <span>{option}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-destructive hover:text-destructive mt-2"
                                                            onClick={() => handleRemoveResource(currentPreviewSlide, resourceIndex)}
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Remover
                                                        </Button>
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                    </CardContent>
                                </Card>

                                <div className="flex justify-between items-center">
                                    <Button
                                        type="button"
                                        onClick={() => setCurrentPreviewSlide(prev => Math.max(0, prev - 1))}
                                        disabled={currentPreviewSlide === 0}
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-2" />
                                        Slide Anterior
                                    </Button>
                                    <div className="text-sm text-muted-foreground space-y-1 text-center">
                                        <div>
                                            Slide {currentPreviewSlide + 1} de {formData.slides.length}
                                        </div>
                                        <div className="text-xs">
                                            {getActiveSlides().length} slides selecionados
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={() => setCurrentPreviewSlide(prev =>
                                            Math.min(formData.slides.length - 1, prev + 1))}
                                        disabled={currentPreviewSlide === formData.slides.length - 1}
                                    >
                                        Próximo Slide
                                        <ChevronRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Fim da Aula</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="lastHymn" className="text-sm font-medium">
                                Último Hino
                            </label>
                            <HymnSelector
                                value={formData.lastHymn}
                                onChange={handleHymnChange('lastHymn')}
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="lastPrayer" className="text-sm font-medium">
                                Última Oração
                            </label>
                            <Input
                                id="lastPrayer"
                                name="lastPrayer"
                                value={formData.lastPrayer}
                                onChange={handleInputChange}
                                placeholder="Nome de quem vai orar"
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-6 flex justify-end gap-4">
                    {submitError && (
                        <p className="text-sm text-destructive self-center">{submitError}</p>
                    )}
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSubmitting ? 'Salvando...' : 'Salvar Aula'}
                    </Button>
                </div>
            </form>

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
        </div>
    );
};

export default LessonForm;