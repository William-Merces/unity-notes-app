'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog/dialog';
import { Input } from '@/components/ui/input/input';
import { Button } from '@/components/ui/button/button';
import { X, Plus, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuestionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (data: { content: string; suggestions: string[] }) => void;
}

export function QuestionDialog({ open, onOpenChange, onSave }: QuestionDialogProps) {
    const [question, setQuestion] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>(['']);

    const handleAddSuggestion = () => {
        setSuggestions([...suggestions, '']);
    };

    const handleRemoveSuggestion = (index: number) => {
        if (suggestions.length > 1) {
            setSuggestions(suggestions.filter((_, i) => i !== index));
        }
    };

    const handleSuggestionChange = (index: number, value: string) => {
        setSuggestions(suggestions.map((s, i) => i === index ? value : s));
    };

    const handleSave = () => {
        const validSuggestions = suggestions.filter(s => s.trim() !== '');
        onSave({
            content: question,
            suggestions: validSuggestions
        });
        setQuestion('');
        setSuggestions(['']);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <HelpCircle className="h-5 w-5 text-primary" />
                        Adicionar Pergunta
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Pergunta</label>
                        <Input
                            placeholder="Digite a pergunta..."
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            className="resize-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Sugestões de Resposta (opcional)</label>
                        <AnimatePresence>
                            {suggestions.map((suggestion, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex gap-2 mb-2"
                                >
                                    <Input
                                        placeholder={`Sugestão ${index + 1}`}
                                        value={suggestion}
                                        onChange={(e) => handleSuggestionChange(index, e.target.value)}
                                    />
                                    {suggestions.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="shrink-0"
                                            onClick={() => handleRemoveSuggestion(index)}
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
                            className="w-full mt-2"
                            onClick={handleAddSuggestion}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar Sugestão
                        </Button>
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSave}
                        disabled={!question.trim()}
                    >
                        Salvar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}