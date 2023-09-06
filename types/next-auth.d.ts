import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

export enum Role {
    user = "user",
    owner = "owner",
    admin = "admin"
}

interface IUser extends DefaultUser {
    userId?: string;
    role?: Role;
}

declare module "next-auth" {
    interface User extends IUser{}

    interface Session extends DefaultSession {
        user?: User;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        userId?: string;
        role?: Role;
    }
}