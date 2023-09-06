import { getServerSession } from "next-auth";
import { NextResponse } from "next/server"

import { authOptions } from "../auth/[...nextauth]/route";
import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        const userId = session?.user?.userId
        const role = session?.user?.role
        const body = await req.json();

        const { name } = body;

        if (!userId) {
            return new NextResponse("Unauthorized.", { status: 401 })
        }

        if (role !== "admin") {
            return new NextResponse("Unauthorized.", { status: 401 })
        }

        if(!name) {
            return new NextResponse("Name is required.", { status: 401 })
        }

        const restaurant = await prismadb.restaurant.create({
            data: {
                name,
                userId
            }
        })

        return NextResponse.json(restaurant);


    } catch (error) {
        console.log('[RESTAURANT_POST]', error)
        return new NextResponse("Internal Error,", { status: 500 });
    } 
}

// export async function GET(
//     req: Request,
//     { params } : { params : { restaurantI } }
//     ) {
    
// }