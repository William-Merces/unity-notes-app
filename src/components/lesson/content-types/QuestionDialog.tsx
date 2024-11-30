// src/components/lesson/content-types/QuestionDialog.tsx
'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog/dialog';
import { Input } from '@/components/ui/input/input';
import { Button } from '@/components/ui/button/button';
import { X, Plus } from 'lucide-react';

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
        setSuggestions(suggestions.filter((_, i) => i !== index));
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
                    <DialogTitle>Adicionar Pergunta</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Pergunta</label>
                        <Input
                            placeholder="Digite a pergunta..."
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Sugestões de Resposta (opcional)</label>
                        <div className="space-y-2">
                            {suggestions.map((suggestion, index) => (
                                <div key={index} className="flex gap-2">
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
                                            onClick={() => handleRemoveSuggestion(index)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-2"
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
                    <Button type="button" onClick={handleSave} disabled={!question.trim()}>
                        Salvar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}