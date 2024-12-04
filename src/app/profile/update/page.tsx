// src/app/profile/update/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card/card';
import { Button } from '@/components/ui/button/button';
import { Input } from '@/components/ui/input/input';
import { Loader2, Plus } from 'lucide-react';
import { FormSelect } from '@/components/ui/form/form-select';
import { User } from '@/types/user';

interface AuthContextValue {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

export default function UpdateProfilePage() {
    const { user } = useAuth() as AuthContextValue;
    const router = useRouter();

    useEffect(() => {
        if (!user) {
            router.push('/auth/login');
        }
    }, [user, router]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        stake: '',
        ward: '',
        newStake: '',
        newWard: '',
        organization: ''
    });
    const [showNewStake, setShowNewStake] = useState(false);
    const [showNewWard, setShowNewWard] = useState(false);

    const stakes = [
        {
            id: "vitoria-conquista",
            name: "Estaca Vitória da Conquista",
            wards: [
                { id: "sumare", name: "Ala Sumaré" },
                { id: "brasil", name: "Ala Brasil" },
                { id: "aeroporto", name: "Ala Aeroporto VdC" },
                { id: "brumado", name: "Ala Brumado" },
                { id: "morada-real", name: "Ala Morada Real" },
                { id: "candeias", name: "Ala Candeias" },
                { id: "morada-passaros", name: "Ramo Morada dos Pássaros" },
                { id: "pocoes", name: "Ala Poções" },
                { id: "itapetinga", name: "Ala Itapetinga" }
            ]
        }
    ];

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                stake: user.ward?.stake?.id || '',
                ward: user.ward?.id || '',
                organization: user.organization || ''
            }));
        }
    }, [user]);

    const currentStake = stakes.find(s => s.id === formData.stake);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const requestBody = {
                ward: showNewWard ? undefined : formData.ward,
                stake: showNewStake ? undefined : formData.stake,
                newWard: showNewWard ? formData.newWard : undefined,
                newStake: showNewStake ? formData.newStake : undefined,
                organization: formData.organization
            };

            const response = await fetch('/api/user/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update profile');
            }

            router.push('/lessons');
        } catch (err) {
            console.error('Update error:', err);
            setError(err instanceof Error ? err.message : 'Erro ao atualizar perfil');
        } finally {
            setLoading(false);
        }
    };

    const handleStakeChange = (value: string) => {
        setFormData(prev => ({ ...prev, stake: value, ward: '' }));
    };

    const handleWardChange = (value: string) => {
        setFormData(prev => ({ ...prev, ward: value }));
    };

    const handleOrganizationChange = (value: string) => {
        setFormData(prev => ({ ...prev, organization: value }));
    };

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Atualizar Perfil</CardTitle>
                    <CardDescription>
                        Vincule-se a uma ala para começar a usar o sistema
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Estaca</label>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    {!showNewStake ? (
                                        <FormSelect
                                            value={formData.stake}
                                            onChange={handleStakeChange}
                                            options={stakes.map(stake => ({
                                                value: stake.id,
                                                label: stake.name
                                            }))}
                                            placeholder="Selecione uma estaca"
                                        />
                                    ) : (
                                        <Input
                                            placeholder="Nome da nova estaca"
                                            value={formData.newStake}
                                            onChange={(e) => setFormData(prev => ({ ...prev, newStake: e.target.value }))}
                                        />
                                    )}
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => {
                                        setShowNewStake(!showNewStake);
                                        setFormData(prev => ({ ...prev, stake: '', ward: '', newStake: '' }));
                                    }}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Ala</label>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    {!showNewWard ? (
                                        <FormSelect
                                            value={formData.ward}
                                            onChange={handleWardChange}
                                            options={currentStake?.wards.map(ward => ({
                                                value: ward.id,
                                                label: ward.name
                                            })) || []}
                                            placeholder="Selecione uma ala"
                                            disabled={!formData.stake || showNewStake}
                                        />
                                    ) : (
                                        <Input
                                            placeholder="Nome da nova ala"
                                            value={formData.newWard}
                                            onChange={(e) => setFormData(prev => ({ ...prev, newWard: e.target.value }))}
                                        />
                                    )}
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => {
                                        setShowNewWard(!showNewWard);
                                        setFormData(prev => ({ ...prev, ward: '', newWard: '' }));
                                    }}
                                    disabled={!formData.stake && !showNewStake}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Organização</label>
                            <FormSelect
                                value={formData.organization}
                                onChange={handleOrganizationChange}
                                options={[
                                    { value: 'elders', label: 'Quórum de Élderes' },
                                    { value: 'relief_society', label: 'Sociedade de Socorro' }
                                ]}
                                placeholder="Selecione uma organização"
                            />
                        </div>

                        {error && (
                            <div className="text-sm font-medium text-destructive">{error}</div>
                        )}
                    </CardContent>

                    <CardFooter>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading || (!formData.organization || 
                                (!showNewStake && !formData.stake) || 
                                (showNewStake && !formData.newStake) || 
                                (!showNewWard && !formData.ward) || 
                                (showNewWard && !formData.newWard))}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Atualizando...
                                </>
                            ) : (
                                'Atualizar'
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}