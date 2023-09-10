import { PrismaClient, User } from "@prisma/client";
import { compare } from "bcrypt";
import { error } from "console";
import NextAuth, {
  RequestInternal,
  type NextAuthOptions,
  Awaitable,
} from "next-auth";
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
        _req: Pick<RequestInternal, "query" | "body" | "headers" | "method">
      ) {
        try {
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

          if (isPasswordValid) {
            return {
              userId: user.userId,
              email: user.email,
              name: user.name,
              role: user.role,
              image: user.image,
            };
          }
          return null;
        } catch (error: any) {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      // console.log('JWT Callback', {token,user})
      if (user) {
        token.userId = user.userId;
        token.role = user.role;
      }
      return token;
    },
    session: ({ session, token }) => {
      // console.log('Session Callback', {session, token})
      if (token && session.user) {
        session.user.role = token.role;
        session.user.userId = token.userId;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };