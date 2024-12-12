'use client';

import ClassList from '@/components/class/ClassList';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs/tabs';
import { Card, CardContent } from '@/components/ui/card/card';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ClassesPage() {
    const searchParams = useSearchParams();
    const defaultTab = searchParams.get('mode') === 'explore' ? 'explore' : 'enrolled';
    const [activeTab, setActiveTab] = useState(defaultTab);

    return (
        <div className="container mx-auto p-4 space-y-6">
            <Card>
                <CardContent className="p-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="w-full">
                            <TabsTrigger value="enrolled" className="flex-1">
                                My Classes
                            </TabsTrigger>
                            <TabsTrigger value="explore" className="flex-1">
                                Explore Classes
                            </TabsTrigger>
                        </TabsList>

                        <div className="mt-6">
                            <TabsContent value="enrolled">
                                <ClassList mode="enrolled" />
                            </TabsContent>

                            <TabsContent value="explore">
                                <ClassList mode="available" />
                            </TabsContent>
                        </div>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}