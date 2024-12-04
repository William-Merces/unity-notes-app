// src/contexts/LessonContext.tsx

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';

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
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isSync, setIsSync] = useState(false);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [handRaises, setHandRaises] = useState<HandRaise[]>([]);
    const [raisedHand, setRaisedHand] = useState(false);
    const [pollResults, setPollResults] = useState<Record<string, Record<string, number>>>({});
    const [isTeacher, setIsTeacher] = useState(false);

    useEffect(() => {
        if (isSync && !socket) {
            const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/lessons/${lessonId}`);

            ws.onopen = () => {
                ws.send(JSON.stringify({
                    type: 'JOIN',
                    lessonId,
                    userId: user?.id,
                    userName: user?.name,
                    isGuest: !user?.ward
                }));
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);

                switch (data.type) {
                    case 'PARTICIPANTS_UPDATE':
                        setParticipants(data.participants);
                        break;

                    case 'HAND_RAISE':
                        setHandRaises(prev => [...prev, data.handRaise]);
                        break;

                    case 'HAND_LOWER':
                        setHandRaises(prev =>
                            prev.filter(h => h.userId !== data.userId)
                        );
                        break;

                    case 'POLL_UPDATE':
                        setPollResults(prev => ({
                            ...prev,
                            [data.pollId]: data.results
                        }));
                        break;

                    case 'SLIDE_CHANGE':
                        setCurrentSlide(data.slide);
                        break;

                    case 'TEACHER_STATUS':
                        setIsTeacher(data.isTeacher);
                        break;
                }
            };

            setSocket(ws);
            return () => ws.close();
        }
    }, [isSync, lessonId, user]);

    const raiseHand = async () => {
        if (!raisedHand && socket) {
            socket.send(JSON.stringify({
                type: 'HAND_RAISE',
                lessonId,
                userId: user?.id,
                userName: user?.name
            }));
            setRaisedHand(true);
        }
    };

    const lowerHand = async () => {
        if (raisedHand && socket) {
            socket.send(JSON.stringify({
                type: 'HAND_LOWER',
                lessonId,
                userId: user?.id
            }));
            setRaisedHand(false);
        }
    };

    const votePoll = async (pollId: string, option: string) => {
        if (socket) {
            socket.send(JSON.stringify({
                type: 'POLL_VOTE',
                lessonId,
                pollId,
                userId: user?.id,
                option
            }));
        }
    };

    const giveVoice = (userId: string) => {
        if (isTeacher && socket) {
            socket.send(JSON.stringify({
                type: 'GIVE_VOICE',
                lessonId,
                userId
            }));
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