import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import NextAuth, { Awaitable, RequestInternal, User } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const prisma = new PrismaClient();

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "credentials",
            credentials: {
                username: {
                    label: "Email-ID",
                    type: "text",
                    placeholder: "john@doe.com"
                },
                password: {}
            },
            authorize: function (credentials: Record<'username' | 'password', string> | undefined, req: Pick<RequestInternal, 'query' | 'body' | 'headers' | 'method'>): Awaitable<User | null> {
                throw new Error('Function not implemented.');
            }
        })
    ],
    adapter: PrismaAdapter(prisma)
})