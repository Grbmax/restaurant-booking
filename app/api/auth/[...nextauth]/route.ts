import prismadb from "@/lib/prismadb";
import { compare } from "bcrypt";
import NextAuth, {
  RequestInternal,
  type NextAuthOptions,
  User,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

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
          if (!credentials?.email || !credentials?.password) {
            return null;
          }
          const user = await prismadb.user.findUnique({
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
            } as User;
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
      if (user) {
        token.userId = user.userId;
        token.role = user.role;
      }
      return token;
    },
    session: ({ session, token }) => {
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