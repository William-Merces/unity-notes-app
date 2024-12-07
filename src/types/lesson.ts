// src/types/lesson.ts

export interface Ward {
    id: string;
    name: string;
    stake?: Stake;
    classes?: Class[];
}

export interface Stake {
    id: string;
    name: string;
    wards: Ward[];
}

export interface Resource {
    id: string;
    type: 'question' | 'scripture' | 'poll';
    content?: string;
    reference?: string;
    options?: string[];
    suggestions?: string[];
}

export interface Vote {
    id: string;
    resourceId: string;
    userId: string;
    option: string;
    timestamp: Date;
}

export interface Slide {
    id: string;
    order: number;
    content: string;
    lessonId: string;
    resources: Resource[];
}

export interface HandRaise {
    userId: string;
    userName: string;
    timestamp: Date;
    resolved: boolean;
}

export interface Participant {
    userId: string;
    userName: string;
    isGuest: boolean;
    joinedAt: Date;
}

export interface Class {
    id: string;
    name: string;
    ward: Ward;
    _count?: {
        enrollments: number;
    };
}

export interface Lesson {
    id: string;
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
    ward?: Ward;
    classId?: string;
    class?: Class;
    teacherId: string;
    teacher?: {
        id: string;
        name: string;
    };
    createdAt: Date;
    updatedAt: Date;
    slides: Slide[];
    _count?: {
        attendance: number;
    };
}