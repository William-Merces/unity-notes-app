// src/components/room/types.ts

import { Lesson, Class } from '@/types/lesson';

export interface Participant {
    userId: string;
    userName: string;
    isGuest: boolean;
    joinedAt: Date;
}

export interface HandRaise {
    userId: string;
    userName: string;
    timestamp: Date;
    resolved: boolean;
}

export interface RoomDisplayProps {
    lesson: Lesson;
    enrolledClasses: Class[];
    onSlideChange: (slideIndex: number) => void;
    onRaiseHand: () => void;
    onLowerHand: () => void;
    onSync: () => void;
    onVotePoll: (pollId: string, option: string) => void;
    currentSlide: number;
    isSync: boolean;
    handRaises: HandRaise[];
    connectedUsers: number;
    isTeacher: boolean;
}