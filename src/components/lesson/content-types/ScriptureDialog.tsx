// src/components/lesson/content-types/ScriptureDialog.tsx
'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog/dialog';
import { Input } from '@/components/ui/input/input';
import { Button } from '@/components/ui/button/button';
import { Textarea } from '@/components/ui/textarea/textarea';

interface ScriptureDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (data: { reference: string; content: string }) => void;
}

export function ScriptureDialog({ open, onOpenChange, onSave }: ScriptureDialogProps) {
    const [reference, setReference] = useState('');
    const [content, setContent] = useState('');

    const handleSave = () => {
        onSave({ reference, content });
        setReference('');
        setContent('');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Adicionar Escritura</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Referência</label>
                        <Input
                            placeholder="Ex: 1 Néfi 3:7"
                            value={reference}
                            onChange={(e) => setReference(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Texto da Escritura</label>
                        <Textarea
                            placeholder="Digite o texto da escritura..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={4}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSave}
                        disabled={!reference.trim() || !content.trim()}
                    >
                        Salvar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}