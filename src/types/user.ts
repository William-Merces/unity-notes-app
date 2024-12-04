// src/types/user.ts
export interface Ward {
    id: string;
    name: string;
    stake?: Stake;
}

export interface Stake {
    id: string;
    name: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    ward?: Ward;
    organization?: string;
}