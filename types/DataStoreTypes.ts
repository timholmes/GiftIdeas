import { Timestamp } from "firebase/firestore";

export declare interface User {
    firstName: string,
    email: string
    sub?: string,
    email_verified?: boolean
}

export declare interface Idea {
    id?: string,
    title: string,
    description: string
}

export declare interface ConnectionRequest {
    otherEmail: string,
    direction: 'incoming' | 'outgoing',
    createdAt: Timestamp | Date
}
