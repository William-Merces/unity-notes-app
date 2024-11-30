// src/components/lesson/content-types/PollDialog.tsx
'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog/dialog';
import { Input } from '@/components/ui/input/input';
import { Button } from '@/components/ui/button/button';
import { X, Plus } from 'lucide-react';

interface PollDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (data: { question: string; options: string[] }) => void;
}

export function PollDialog({ open, onOpenChange, onSave }: PollDialogProps) {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState<string[]>(['', '']); // Mínimo de duas opções

    const handleAddOption = () => {
        setOptions([...options, '']);
    };

    const handleRemoveOption = (index: number) => {
        if (options.length > 2) {
            setOptions(options.filter((_, i) => i !== index));
        }
    };

    const handleOptionChange = (index: number, value: string) => {
        setOptions(options.map((opt, i) => i === index ? value : opt));
    };

    const handleSave = () => {
        const validOptions = options.filter(opt => opt.trim() !== '');
        if (validOptions.length >= 2) {
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
                    <DialogTitle>Adicionar Enquete</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Pergunta da Enquete</label>
                        <Input
                            placeholder="Digite a pergunta..."
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Opções de Resposta</label>
                        <div className="space-y-2">
                            {options.map((option, index) => (
                                <div key={index} className="flex gap-2">
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
                                </div>
                            ))}
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={handleAddOption}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar Opção
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
                        disabled={!question.trim() || options.filter(opt => opt.trim() !== '').length < 2}
                    >
                        Salvar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}