// src/contexts/LessonContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { pusherClient } from '@/lib/pusher';

interface Participant {
    userId: string;
    userName: string;
    isGuest: boolean;
    joinedAt: Date;
}

interface HandRaise {
    userId: string;
    userName: string;
    timestamp: Date;
    resolved: boolean;
}

interface LessonContextType {
    currentSlide: number;
    setCurrentSlide: (slide: number) => void;
    isSync: boolean;
    setIsSync: (sync: boolean) => void;
    participants: Participant[];
    handRaises: HandRaise[];
    raisedHand: boolean;
    raiseHand: () => Promise<void>;
    lowerHand: () => Promise<void>;
    pollResults: Record<string, Record<string, number>>;
    votePoll: (pollId: string, option: string) => void;
    isTeacher: boolean;
    giveVoice: (userId: string) => void;
}

const LessonContext = createContext<LessonContextType | undefined>(undefined);

export function LessonProvider({
    children,
    lessonId
}: {
    children: React.ReactNode;
    lessonId: string;
}) {
    const { user } = useAuth();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isSync, setIsSync] = useState(false);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [handRaises, setHandRaises] = useState<HandRaise[]>([]);
    const [raisedHand, setRaisedHand] = useState(false);
    const [pollResults, setPollResults] = useState<Record<string, Record<string, number>>>({});
    const [isTeacher, setIsTeacher] = useState(false);

    useEffect(() => {
        if (isSync && user) {
            // Subscribe to the lesson channel
            const channel = pusherClient.subscribe(`lesson-${lessonId}`);

            // Join the lesson
            fetch('/api/lessons/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lessonId,
                    userId: user.id,
                    userName: user.name,
                    isGuest: !user.ward
                })
            });

            // Listen to events
            channel.bind('participants-update', (data: { participants: Participant[] }) => {
                setParticipants(data.participants);
            });

            channel.bind('hand-raise', (data: { handRaise: HandRaise }) => {
                setHandRaises(prev => [...prev, data.handRaise]);
            });

            channel.bind('hand-lower', (data: { userId: string }) => {
                setHandRaises(prev => prev.filter(h => h.userId !== data.userId));
            });

            channel.bind('poll-update', (data: { pollId: string, results: Record<string, number> }) => {
                setPollResults(prev => ({
                    ...prev,
                    [data.pollId]: data.results
                }));
            });

            channel.bind('slide-change', (data: { slide: number }) => {
                setCurrentSlide(data.slide);
            });

            channel.bind('teacher-status', (data: { isTeacher: boolean }) => {
                setIsTeacher(data.isTeacher);
            });

            return () => {
                pusherClient.unsubscribe(`lesson-${lessonId}`);
            };
        }
    }, [isSync, lessonId, user]);

    const raiseHand = async () => {
        if (!raisedHand && user) {
            await fetch('/api/lessons/raise-hand', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lessonId,
                    userId: user.id,
                    userName: user.name
                })
            });
            setRaisedHand(true);
        }
    };

    const lowerHand = async () => {
        if (raisedHand && user) {
            await fetch('/api/lessons/lower-hand', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lessonId,
                    userId: user.id
                })
            });
            setRaisedHand(false);
        }
    };

    const votePoll = async (pollId: string, option: string) => {
        if (user) {
            await fetch('/api/lessons/vote-poll', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lessonId,
                    pollId,
                    userId: user.id,
                    option
                })
            });
        }
    };

    const giveVoice = async (userId: string) => {
        if (isTeacher && user) {
            await fetch('/api/lessons/give-voice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lessonId,
                    userId
                })
            });
        }
    };

    return (
        <LessonContext.Provider value={{
            currentSlide,
            setCurrentSlide,
            isSync,
            setIsSync,
            participants,
            handRaises,
            raisedHand,
            raiseHand,
            lowerHand,
            pollResults,
            votePoll,
            isTeacher,
            giveVoice
        }}>
            {children}
        </LessonContext.Provider>
    );
}

export const useLessonContext = () => {
    const context = useContext(LessonContext);
    if (context === undefined) {
        throw new Error('useLessonContext must be used within a LessonProvider');
    }
    return context;
};