import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.userId;
    const role = session?.user?.role;

    const { searchParams } = new URL(req.url);
    const isActive = searchParams.get("isActive") || false;

    let restaurants;

    if (role === "admin") {
      restaurants = await prismadb.restaurant.findMany({
        where: {
          adminId: userId,
        },
        include: {
          owners: true,
          images: true,
        },
      });
    } else if (role === "owner") {
      restaurants = await prismadb.restaurant.findMany({
        where: {
          owners: {
            some: {
              userId,
            },
          },
        },
      });
    } else {
      restaurants = await prismadb.restaurant.findMany({
        where: {
          isActive: isActive ? false : true,
        },
        select: {
          restaurantId: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          tables: {
            select: {
              capacity: true,
            },
            take: 1, // Only take the first table
          },
          images: {
            select: {
              url: true,
            },
          },
        },
      });
    }

    return NextResponse.json(restaurants);
  } catch (error) {
    console.log("[RESTAURANT_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
