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
}

export function PollDialog({ open, onOpenChange, onSave }: PollDialogProps) {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState<string[]>(['', '']); // Mínimo de duas opções
    const [isValid, setIsValid] = useState(false);

    const validateForm = () => {
        const validOptions = options.filter(opt => opt.trim().length > 0);
        setIsValid(question.trim().length > 0 && validOptions.length >= 2);
    };

    const handleAddOption = () => {
        setOptions([...options, '']);
    };

    const handleRemoveOption = (index: number) => {
        if (options.length > 2) {
            setOptions(options.filter((_, i) => i !== index));
            validateForm();
        }
    };

    const handleOptionChange = (index: number, value: string) => {
        setOptions(options.map((opt, i) => i === index ? value : opt));
        validateForm();
    };

    const handleSave = () => {
        if (isValid) {
            const validOptions = options.filter(opt => opt.trim().length > 0);
            onSave({
                question,
                options: validOptions
            });
            setQuestion('');
            setOptions(['', '']);
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
                            value={question}
                            onChange={(e) => {
                                setQuestion(e.target.value);
                                validateForm();
                            }}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Opções de Resposta</label>
                        <AnimatePresence>
                            {options.map((option, index) => (
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
                                    {options.length > 2 && (
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