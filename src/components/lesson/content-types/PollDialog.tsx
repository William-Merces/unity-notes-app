// src/components/lesson/content-types/PollDialog.tsx

'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog/dialog';
import { Input } from '@/components/ui/input/input';
import { Button } from '@/components/ui/button/button';
import { X, Plus, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PollDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (data: { question: string; options: string[] }) => void;
    question: string;
    options: string[];
}

export function PollDialog({ open, onOpenChange, onSave, question, options }: PollDialogProps) {
    const [questionState, setQuestionState] = useState(question);
    const [optionsState, setOptionsState] = useState<string[]>(options || []);
    const [isValid, setIsValid] = useState(false);

    const validateForm = () => {
        const validOptions = optionsState.filter(opt => opt.trim().length > 0);
        setIsValid(questionState.trim().length > 0 && validOptions.length >= 2);
    };

    const handleAddOption = () => {
        setOptionsState([...optionsState, '']);
    };

    const handleRemoveOption = (index: number) => {
        if (optionsState.length > 2) {
            setOptionsState(optionsState.filter((_, i) => i !== index));
            validateForm();
        }
    };

    const handleOptionChange = (index: number, value: string) => {
        setOptionsState(optionsState.map((opt, i) => i === index ? value : opt));
        validateForm();
    };

    const handleSave = () => {
        if (isValid) {
            const validOptions = optionsState.filter(opt => opt.trim().length > 0);
            onSave({
                question: questionState,
                options: validOptions
            });
            setQuestionState('');
            setOptionsState(['', '']);
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BarChart2 className="h-5 w-5 text-primary" />
                        Adicionar Enquete
                    </DialogTitle>
                </DialogHeader>

                <motion.div
                    className="grid gap-4 py-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Pergunta da Enquete</label>
                        <Input
                            placeholder="Digite a pergunta..."
                            value={questionState}
                            onChange={(e) => {
                                setQuestionState(e.target.value);
                                validateForm();
                            }}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Opções de Resposta</label>
                        <AnimatePresence>
                            {optionsState && optionsState.map((option, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex gap-2 mb-2"
                                >
                                    <Input
                                        placeholder={`Opção ${index + 1}`}
                                        value={option}
                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                    />
                                    {optionsState.length > 2 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemoveOption(index)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={handleAddOption}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar Opção
                        </Button>
                    </div>
                </motion.div>

                <div className="flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSave}
                        disabled={!isValid}
                        className="relative"
                    >
                        <motion.div
                            initial={false}
                            animate={isValid ? { scale: [1, 1.05, 1] } : {}}
                            transition={{ duration: 0.2 }}
                        >
                            Salvar
                        </motion.div>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}