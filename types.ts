import { DefaultSession } from "next-auth";

export interface CustomSession extends 
DefaultSession {
    userId: string;
    role: string;
}