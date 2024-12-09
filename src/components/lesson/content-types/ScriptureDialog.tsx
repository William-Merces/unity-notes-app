// src/components/lesson/content-types/ScriptureDialog.tsx

'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog/dialog';
import { Input } from '@/components/ui/input/input';
import { Button } from '@/components/ui/button/button';
import { Textarea } from '@/components/ui/textarea/textarea';
import { Book } from 'lucide-react';
import { motion } from 'framer-motion';

interface ScriptureDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (data: { reference: string; content: string }) => void;
    reference: string;
    content: string;
}

export function ScriptureDialog({ open, onOpenChange, onSave, reference, content }: ScriptureDialogProps) {
    const [referenceState, setReferenceState] = useState(reference);
    const [contentState, setContentState] = useState(content);
    const [isValid, setIsValid] = useState(false);

    const validateForm = () => {
        setIsValid(referenceState.trim().length > 0 && contentState.trim().length > 0);
    };

    const handleSave = () => {
        if (isValid) {
            onSave({ reference: referenceState, content: contentState });
            setReferenceState('');
            setContentState('');
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Book className="h-5 w-5 text-primary" />
                        Adicionar Escritura
                    </DialogTitle>
                </DialogHeader>

                <motion.div
                    className="grid gap-4 py-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Referência</label>
                        <Input
                            placeholder="Ex: 1 Néfi 3:7"
                            value={referenceState}
                            onChange={(e) => {
                                setReferenceState(e.target.value);
                                validateForm();
                            }}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Texto da Escritura</label>
                        <Textarea
                            placeholder="Digite o texto da escritura..."
                            value={contentState}
                            onChange={(e) => {
                                setContentState(e.target.value);
                                validateForm();
                            }}
                            rows={4}
                            className="resize-none"
                        />
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