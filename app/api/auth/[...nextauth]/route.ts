import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient, User } from "@prisma/client";
import { compare } from "bcrypt";
import NextAuth, { RequestInternal, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "john@doe.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(
        credentials: Record<"email" | "password", string> | undefined,
        req: Pick<RequestInternal, "query" | "body" | "headers" | "method">
      ) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          userId: user.userId,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image
        };
      },
    }),
  ],
  callbacks: {
    session: ({ session, token }) => {
      // console.log('Session Callback', {session, token})
      return {
        userId: token.userId,
        role: token.role,
        ...session,
      }
    },
    jwt: ({ token, user }) => {
      // console.log('JWT Callback', {token,user})
      if (user) {
        const u = user as unknown as User
        return {
          ...token,
          userId: u.userId,
          role: u.role,
        }
      }
      return token
    }
  },
  session: { strategy: "jwt" },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
