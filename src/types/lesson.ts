// src/types/lesson.ts

// Interface base para entidades com campos comuns
export interface BaseEntity {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

// Interface para stake (estaca)
export interface Stake extends BaseEntity {
    wards: Ward[];
}

// Interface para ward (ala)
export interface Ward extends BaseEntity {
    stakeId: string;
    stake?: Stake; // Tornado opcional para flexibilidade
    classes?: Class[];
}

// Interface para class (classe/quórum)
export interface Class extends BaseEntity {
    wardId: string;
    ward?: Ward; // Tornado opcional
    nextDate?: Date | null;
    _count?: {
        enrollments: number;
    };
    organization?: string;
    lessons?: Lesson[];
    currentLesson?: Lesson | null;
    nextLesson?: Lesson | null;
}

// Interface para recursos de slides
export interface Resource {
    id: string;
    type: 'question' | 'scripture' | 'poll';
    content?: string;
    reference?: string;
    options?: string[];
    suggestions?: string[];
    slideId: string;
}

// Interface para slides
export interface Slide {
    id: string;
    order: number;
    content: string;
    lessonId: string;
    resources: Resource[];
}

// Interface para levantar a mão
export interface HandRaise {
    id: string;
    userId: string;
    userName: string;
    timestamp: Date;
    resolved: boolean;
    lessonId: string;
}

// Interface para participantes
export interface Participant {
    userId: string;
    userName: string;
    isGuest: boolean;
    joinedAt: Date;
}

// Interface para aula
export interface Lesson extends BaseEntity {
    title: string;
    firstHymn: string;
    firstPrayer: string;
    announcements?: string;
    lastHymn: string;
    lastPrayer: string;
    discourse: string;
    isActive: boolean;
    currentSlide: number;
    wardId: string;
    ward?: Ward; // Tornado opcional
    classId: string;
    class?: Class; // Tornado opcional
    teacherId: string;
    teacher?: {
        id: string;
        name: string;
    }; // Tornado opcional
    slides: Slide[];
    _count?: {
        attendance: number;
    };
}

// Type guards
export function isWard(obj: unknown): obj is Ward {
    return Boolean(
        obj &&
        typeof obj === 'object' &&
        'id' in obj &&
        'name' in obj &&
        'stakeId' in obj
    );
}

export function isStake(obj: unknown): obj is Stake {
    return Boolean(
        obj &&
        typeof obj === 'object' &&
        'id' in obj &&
        'name' in obj &&
        'wards' in obj &&
        Array.isArray((obj as Stake).wards)
    );
}

// Type map para garantir que todas as propriedades sejam indexáveis
export type IndexableEntity<T> = {
    [K in keyof T]: T[K];
};

export type IndexableWard = IndexableEntity<Ward>;
export type IndexableStake = IndexableEntity<Stake>;
export type IndexableClass = IndexableEntity<Class>;
export type IndexableLesson = IndexableEntity<Lesson>;

// Utility types para transformações comuns
export type WithoutTimestamps<T> = Omit<T, 'createdAt' | 'updatedAt'>;
export type WithOptionalFields<T> = Partial<T>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
