// src/types/user.ts

// Interfaces básicas para os relacionamentos
export interface Stake {
    id: string;
    name: string;
    wards: Ward[];
    createdAt: Date;
    updatedAt: Date;
}

export interface Ward {
    id: string;
    name: string;
    stakeId: string;
    stake?: Stake; // Tornado opcional para maior flexibilidade
    createdAt: Date;
    updatedAt: Date;
}

// Tipos de papéis permitidos
export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

// Tipos de organizações permitidas
export type Organization = 'elders' | 'relief_society';

// Interface principal do usuário
export interface User {
    id: string;
    name: string;
    email: string;
    wardId?: string;
    ward?: Ward; // Tornado opcional
    organization?: Organization;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}

// Interface para dados brutos do usuário vindos da API
export interface RawUser extends Omit<User, 'createdAt' | 'updatedAt' | 'ward'> {
    createdAt: string;
    updatedAt: string;
    ward?: Partial<Ward>;
}

// Interface para criação de usuário
export interface CreateUserDTO {
    name: string;
    email: string;
    password: string;
    wardId?: string;
    organization?: Organization;
    role?: UserRole;
}

// Interface para atualização de usuário
export interface UpdateUserDTO {
    name?: string;
    email?: string;
    password?: string;
    wardId?: string;
    organization?: Organization;
    role?: UserRole;
}

// Type guard para verificar se um objeto é um usuário válido
export function isUser(obj: unknown): obj is User {
    return Boolean(
        obj &&
        typeof obj === 'object' &&
        'id' in obj &&
        'name' in obj &&
        'email' in obj &&
        'role' in obj
    );
}

// Type guard para verificar role do usuário
export function hasRole(user: User, role: UserRole): boolean {
    return user.role === role;
}

// Tipo para permissões baseadas em papel
export type RolePermissions = {
    [K in UserRole]: string[];
};

// Permissões padrão por papel
export const DEFAULT_PERMISSIONS: RolePermissions = {
    STUDENT: ['view_lessons', 'join_lessons'],
    TEACHER: ['view_lessons', 'join_lessons', 'create_lessons', 'edit_lessons'],
    ADMIN: ['view_lessons', 'join_lessons', 'create_lessons', 'edit_lessons', 'manage_users', 'manage_classes']
};

// Helper para verificar permissões
export function hasPermission(user: User, permission: string): boolean {
    return DEFAULT_PERMISSIONS[user.role]?.includes(permission) || false;
}

// Constantes úteis
export const USER_ROLES: UserRole[] = ['STUDENT', 'TEACHER', 'ADMIN'];
export const ORGANIZATIONS: Organization[] = ['elders', 'relief_society'];

// Tipo para respostas de erro de autenticação
export interface AuthError {
    message: string;
    code: 'INVALID_CREDENTIALS' | 'USER_NOT_FOUND' | 'UNAUTHORIZED' | 'INVALID_TOKEN';
}

// Tipo para respostas de sucesso de autenticação
export interface AuthSuccess {
    user: User;
    token: string;
}

// Utilitário para verificar se o usuário está autenticado
export function isAuthenticated(user: User | null): user is User {
    return user !== null;
}

// Utilitário para verificar se o usuário está vinculado a uma ala
export function hasWard(user: User): boolean {
    return Boolean(user.wardId && user.ward);
}

// Utilitário para verificar se o usuário está vinculado a uma organização
export function hasOrganization(user: User): boolean {
    return Boolean(user.organization);
}