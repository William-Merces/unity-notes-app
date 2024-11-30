export interface Resource {
    type: 'question' | 'scripture' | 'poll';
    content?: string;
    reference?: string;
    suggestions?: string[];
    options?: string[];
}

export interface Slide {
    content: string;
    resources: Resource[];
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
    createdAt: Date;
    slides: Slide[];
}