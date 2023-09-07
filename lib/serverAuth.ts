import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prismadb from "./prismadb";

const serverAuth = async (
    req: NextRequest,
    res: NextResponse
) => {
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.email) {
        throw new Error('Not signed in.');
    }

    const currentUser = await prismadb.user.findUnique({
        where: {
            email: session.user.email
        }
    });

    if (!currentUser) {
        throw new Error('Not signed in')
    }

    return { currentUser };
}

export default serverAuth