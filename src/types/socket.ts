export interface WsMessage {
    type: 'SLIDE_CHANGE' | 'HAND_RAISE' | 'POLL_VOTE';
    slide?: number;
    pollId?: string;
    option?: string;
}

export interface LessonSocket extends WebSocket {
    userId?: string;
    lessonId?: string;
}

export interface HandRaiseData {
    id: string;
    userId: string;
    lessonId: string;
    timestamp: Date;
    resolved: boolean;
    user?: {
        id: string;
        name: string;
    };
}

export interface VoteData {
    userId: string;
    resourceId: string;
    option: string;
}

export interface PollResults {
    option: string;
    _count: number;
}