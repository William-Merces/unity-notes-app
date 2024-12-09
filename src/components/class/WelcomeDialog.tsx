// src/components/class/WelcomeDialog.tsx
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog/dialog';
import { Button } from '@/components/ui/button/button';
import { Card } from '@/components/ui/card/card';
import { UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

interface Class {
    id: string;
    name: string;
    organization: string;
}

interface WelcomeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    wardName: string;
    availableClasses: Class[];
    onEnroll: (classId: string) => Promise<void>;
}

export function WelcomeDialog({
    open,
    onOpenChange,
    wardName,
    availableClasses,
    onEnroll
}: WelcomeDialogProps) {
    const [enrolling, setEnrolling] = useState<string | null>(null);

    const handleEnroll = async (classId: string) => {
        setEnrolling(classId);
        await onEnroll(classId);
        setEnrolling(null);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Bem-vindo à {wardName}!</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Você pode se matricular nas seguintes classes:
                    </p>
                    <div className="space-y-2">
                        {availableClasses.map((classItem) => (
                            <motion.div
                                key={classItem.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Card className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-medium">{classItem.name}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {classItem.organization === 'elders' ? 'Quórum de Élderes' : 'Sociedade de Socorro'}
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEnroll(classItem.id)}
                                            disabled={!!enrolling}
                                        >
                                            <UserPlus className="h-4 w-4 mr-2" />
                                            Matricular
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}