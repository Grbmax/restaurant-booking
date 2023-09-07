import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import prismadb from "@/lib/prismadb";

export async function POST(
    req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session= await getServerSession(authOptions)
    const userId = session?.user?.userId
    const role = session?.user?.role
    const body = await req.json()

    const { name } = body;

    if (!userId || params.userId !== userId) {
        return new NextResponse("Unauthenticated.", { status: 403 })
    }

    if (role !== "admin") {
        return new NextResponse("Unauthorized.", {status: 401})
    }

    if (!name) {
        return new NextResponse("Name is required.", {status: 400}) 
    }

    if (!params.userId) {
        return new NextResponse("User ID is required.", {status: 400}) 
    }

    const restaurant = await prismadb.restaurant.create({
        data: {
            name,
            adminId: userId
        }
    })

    if(restaurant) return NextResponse.json(userId);


  } catch (error) {
    console.log("[RESTAURANT_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.userId
    const role = session?.user?.role

    if (!session || role === "user" || !params.userId) {
        const restaurants = await prismadb.restaurant.findMany({
            select: {
                name: true,
                restaurantId: true,
                images: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                name: 'asc'
            }
        })
        return NextResponse.json(restaurants);
    }

    if (role === "admin") {
        const restaurants = await prismadb.restaurant.findMany({
            where: {
                adminId: userId
            },
            include: {
                owners: true,
                images: true
            }
        })
        return NextResponse.json(restaurants);
    } else if (role === "owner") {
        const restaurants = await prismadb.restaurant.findMany({
            where: {
                owners : {
                    some: {
                        userId
                    }
                }
            }
        })
        return NextResponse.json(restaurants);
    }


  } catch (error) {
    console.log("[RESTAURANT_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
