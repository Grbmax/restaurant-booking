import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: { userId: string } }
  ) {
    try {
      const session = await getServerSession(authOptions)
      const userId = session?.user?.userId
      const role = session?.user?.role
  
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