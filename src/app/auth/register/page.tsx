// src/app/auth/register/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card/card';
import { Button } from '@/components/ui/button/button';
import { Input } from '@/components/ui/input/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select/select';
import { Loader2, Plus, Eye, EyeOff } from 'lucide-react';
import { WelcomeDialog } from '@/components/class/WelcomeDialog';

export default function RegisterPage() {
    const searchParams = useSearchParams();
    const [formData, setFormData] = useState({
        name: '',
        email: searchParams.get('email') || '',
        password: searchParams.get('password') || '',
        stake: '',
        ward: '',
        organization: '',
        newStake: '',
        newWard: '',
        role: 'STUDENT'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showNewStake, setShowNewStake] = useState(false);
    const [showNewWard, setShowNewWard] = useState(false);
    const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
    const [availableClasses, setAvailableClasses] = useState([]);
    const { register } = useAuth();
    const router = useRouter();

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

    const currentStake = stakes.find(s => s.id === formData.stake);
    const currentWard = currentStake?.wards.find(w => w.id === formData.ward);

    const handleEnroll = async (classId: string) => {
        try {
            await fetch('/api/classes/enroll', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ classId })
            });
        } catch (error) {
            console.error('Error enrolling:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const submissionData = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                organization: formData.organization as 'elders' | 'relief_society',
                role: formData.role as 'STUDENT' | 'TEACHER',
                ...(showNewStake && formData.newStake ? { stake: formData.newStake } : {}),
                ...(showNewWard && formData.newWard ? { ward: formData.newWard } : {}),
                ...(!showNewStake && formData.stake ? { stake: formData.stake } : {}),
                ...(!showNewWard && formData.ward ? { ward: formData.ward } : {})
            };

            await register(submissionData);
            
            if (formData.ward) {
                const response = await fetch(`/api/classes?wardId=${formData.ward}`);
                if (response.ok) {
                    const classes = await response.json();
                    setAvailableClasses(classes);
                    setShowWelcomeDialog(true);
                } else {
                    router.push('/lessons');
                }
            } else {
                router.push('/lessons');
            }
        } catch (err) {
            setError('Erro ao registrar usuário');
            setLoading(false);
        }
    };

    return (
        <>
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Registro</CardTitle>
                        <CardDescription>
                            Crie sua conta para acessar o sistema
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nome</label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Senha</label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Papel no Sistema</label>
                                <Select
                                    value={formData.role}
                                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione seu papel" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="STUDENT">Aluno</SelectItem>
                                        <SelectItem value="TEACHER">Professor</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Estaca</label>
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        {!showNewStake ? (
                                            <Select
                                                value={formData.stake}
                                                onValueChange={(value) => {
                                                    setFormData({ ...formData, stake: value, ward: '' });
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione uma estaca" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {stakes.map(stake => (
                                                        <SelectItem key={stake.id} value={stake.id}>
                                                            {stake.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <Input
                                                placeholder="Nome da nova estaca"
                                                value={formData.newStake}
                                                onChange={(e) => setFormData({ ...formData, newStake: e.target.value })}
                                            />
                                        )}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => {
                                            setShowNewStake(!showNewStake);
                                            setFormData({ ...formData, stake: '', ward: '', newStake: '' });
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
                                            <Select
                                                value={formData.ward}
                                                onValueChange={(value) => setFormData({ ...formData, ward: value })}
                                                disabled={!formData.stake || showNewStake}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione uma ala" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {currentStake?.wards.map(ward => (
                                                        <SelectItem key={ward.id} value={ward.id}>
                                                            {ward.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <Input
                                                placeholder="Nome da nova ala"
                                                value={formData.newWard}
                                                onChange={(e) => setFormData({ ...formData, newWard: e.target.value })}
                                            />
                                        )}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => {
                                            setShowNewWard(!showNewWard);
                                            setFormData({ ...formData, ward: '', newWard: '' });
                                        }}
                                        disabled={!formData.stake && !showNewStake}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Organização</label>
                                <Select
                                    value={formData.organization}
                                    onValueChange={(value) => setFormData({ ...formData, organization: value })}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione uma organização" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="elders">Quórum de Élderes</SelectItem>
                                        <SelectItem value="relief_society">Sociedade de Socorro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {error && (
                                <div className="text-sm font-medium text-destructive">{error}</div>
                            )}
                        </CardContent>

                        <CardFooter className="flex flex-col gap-4">
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Registrando...
                                    </>
                                ) : (
                                    'Registrar'
                                )}
                            </Button>

                            <p className="text-sm text-center text-muted-foreground">
                                Já tem uma conta?{' '}
                                <Link
                                    href="/auth/login"
                                    className="text-primary hover:underline"
                                >
                                    Entre
                                </Link>
                            </p>
                        </CardFooter>
                    </form>
                </Card>
            </div>

            <WelcomeDialog
                open={showWelcomeDialog}
                onOpenChange={setShowWelcomeDialog}
                wardName={currentWard?.name || ''}
                availableClasses={availableClasses}
                onEnroll={handleEnroll}
            />
        </>
    );
}