import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { restaurantId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);

    const restaurant = await prismadb.restaurant.findUnique({
      where: {
        restaurantId: params.restaurantId,
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
          take: 1,
        },
        images: {
          select: {
            url: true,
          },
        },
      },
    });
    return NextResponse.json(restaurant);
  } catch (error) {
    console.log("[RESTAURANT_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
