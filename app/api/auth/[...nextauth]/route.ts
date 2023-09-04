import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import NextAuth, { Awaitable, NextAuthOptions, RequestInternal, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: {
                    label: 'Email',
                    type: 'email',
                    placeholder: 'john@doe.com'
                },
                password: { label: 'Password', type: 'password' }
            },
            authorize: function (credentials: Record<"email" | "password", string> | undefined, req: Pick<RequestInternal, "query" | "body" | "headers" | "method">): Awaitable<User | null> {
                const user = {id: '1', name: 'John'}
                return user
            }
        })
    ],
    session: { strategy: 'jwt' }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }