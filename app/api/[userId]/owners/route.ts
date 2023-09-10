import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { hash } from "bcrypt";

import { authOptions } from "../../auth/[...nextauth]/route";
import prismadb from "@/lib/prismadb";

export async function POST(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.userId;
    const userRole = session?.user?.role;
    const body = await req.json();
    const { name, email, password, image, role, restaurantIds } = body;

    if (!userId || !params.userId || params.userId !== userId) {
      return new NextResponse("Unauthenticated.", { status: 403 });
    }

    if (userRole !== "admin") {
      return new NextResponse("Unauthorized.", { status: 401 });
    }

    if (!name) {
      return new NextResponse("Name is required.", { status: 400 });
    }

    if (!email) {
      return new NextResponse("Email ID is required.", { status: 400 });
    }

    if (!password) {
      return new NextResponse("Password is required.", { status: 400 });
    }

    if (!image) {
      return new NextResponse("Images are required.", { status: 400 });
    }

    const hashedPassword = await hash(password, 12);

    const newOwner = await prismadb.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        image,
        role: "owner"
      },
    });
    prismadb.$disconnect();

    if (restaurantIds.length !== 0) {
      const restaurants = await prismadb.restaurant.findMany({
        where: {
          restaurantId: {
            in: restaurantIds,
          },
        },
      });

      for (const restaurantId of restaurantIds) {
        await prismadb.restaurant.update({
          where: {
            restaurantId,
          },
          data: {
            owners: {
              connect: {
                userId: newOwner.userId,
              },
            },
          },
        });
      }
      prismadb.$disconnect();
      return NextResponse.json(restaurants);
    }
    return NextResponse.json(newOwner);
  } catch (error) {
    console.log("[OWNER_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

//optional: GET feature for users.
//Currently this is being done only on front-end and not as an API service.