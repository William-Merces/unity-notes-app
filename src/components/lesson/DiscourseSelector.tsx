import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog/dialog';
import { Button } from '@/components/ui/button/button';
import { Input } from '@/components/ui/input/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card/card';
import { Search } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs/tabs';
import { CONFERENCE_DISCOURSES, CONFERENCE_SESSIONS, type Discourse } from '@/data/conference';

interface DiscourseSelectorProps {
    value: string;
    onChange: (discourse: Discourse) => void;
}

const DiscourseSelector = ({ value, onChange }: DiscourseSelectorProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState<string>("all");

    const filteredDiscourses = CONFERENCE_DISCOURSES.filter(discourse => {
        const matchesSearch =
            discourse.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            discourse.speaker.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesSession =
            selectedSession === "all" || discourse.session === selectedSession;

        return matchesSearch && matchesSession;
    });

    const selectedDiscourse = CONFERENCE_DISCOURSES.find(d => d.url === value);

    const groupedDiscourses = filteredDiscourses.reduce((acc, discourse) => {
        if (!acc[discourse.session]) {
            acc[discourse.session] = [];
        }
        acc[discourse.session].push(discourse);
        return acc;
    }, {} as Record<string, Discourse[]>);

    return (
        <div className="w-full">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal h-auto py-3"
                    >
                        {selectedDiscourse ? (
                            <div className="flex flex-col items-start gap-1">
                                <span className="font-medium">{selectedDiscourse.speaker}</span>
                                <span className="text-sm text-muted-foreground">{selectedDiscourse.session}</span>
                            </div>
                        ) : (
                            "Selecione um discurso..."
                        )}
                    </Button>
                </DialogTrigger>

                <DialogContent className="max-w-3xl max-h-[80vh]">
                    <DialogHeader>
                        <DialogTitle>Selecionar Discurso da Conferência</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por título ou orador..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            <select
                                value={selectedSession}
                                onChange={(e) => setSelectedSession(e.target.value)}
                                className="w-48 rounded-md border border-input bg-background px-3 py-2"
                            >
                                <option value="all">Todas as sessões</option>
                                {CONFERENCE_SESSIONS.map(session => (
                                    <option key={session} value={session}>
                                        {session}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="overflow-y-auto max-h-[60vh] space-y-6">
                            {Object.entries(groupedDiscourses).map(([session, discourses]) => (
                                <div key={session}>
                                    <h3 className="font-semibold mb-3">{session}</h3>
                                    <div className="space-y-3">
                                        {discourses.map((discourse) => (
                                            <Card
                                                key={discourse.id}
                                                className="cursor-pointer hover:bg-accent transition-colors"
                                                onClick={() => {
                                                    onChange(discourse);
                                                    setIsOpen(false);
                                                }}
                                            >
                                                <CardHeader className="p-4">
                                                    <div className="font-medium">{discourse.speaker}</div>
                                                </CardHeader>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default DiscourseSelector;