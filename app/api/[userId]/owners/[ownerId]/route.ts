import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { hash } from "bcrypt";

import prismadb from "@/lib/prismadb";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  _req: Request,
  {
    params,
  }: {
    params: { userId: string; ownerId: string };
  }
) {
  try {
    const owner = await prismadb.user.findUnique({
      where: {
        userId: params.ownerId,
      },
      include: {
        ownerRestaurants: true,
      },
    });

    if (!owner) {
      return new NextResponse("Owner not found.", { status: 404 });
    }

    const { userId, name, email, image, ownerRestaurants } = owner;

    return NextResponse.json({
      userId,
      name,
      email,
      image,
      ownerRestaurants,
    });
  } catch (error) {
    console.error("[OWNER_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { userId: string; ownerId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.userId;
    const userRole = session?.user?.role;
    const body = await req.json();
    const { name, email, password, image, restaurantIds } = body;

    //DEBUG
    // console.log(params);
    // return new NextResponse("DEBUG", { status: 200 });

    if (!userId || !params.ownerId || params.userId !== userId) {
      return new NextResponse("Unauthenticated.", { status: 403 });
    }

    if (userRole !== "admin") {
      return new NextResponse("Unauthorized.", { status: 401 });
    }

    const owner = await prismadb.user.findUnique({
      where: {
        userId: params.ownerId,
      },
      include: {
        ownerRestaurants: true,
      },
    });

    if (!owner) {
      return new NextResponse("Owner not found.", { status: 404 });
    }

    // Disconnect restaurants in a loop
    for (const restaurant of owner.ownerRestaurants) {
      await prismadb.restaurant.update({
        where: {
          restaurantId: restaurant.restaurantId,
        },
        data: {
          owners: {
            disconnect: {
              userId: params.ownerId,
            },
          },
        },
      });
    }

    // Connect the new associations using a loop
    for (const restaurantId of restaurantIds) {
      await prismadb.restaurant.update({
        where: {
          restaurantId,
        },
        data: {
          owners: {
            connect: {
              userId: params.ownerId,
            },
          },
        },
      });
    }

    if (password) {
      const hashedPassword = await hash(password, 12);
      await prismadb.user.update({
        where: {
          userId: params.ownerId,
        },
        data: {
          password: hashedPassword,
        },
      });
    }

    const dataToUpdate: any = {
      email: email || owner.email,
      name: name || owner.name,
      image: image || owner.image,
    };

    const updatedOwner = await prismadb.user.update({
      where: {
        userId: params.ownerId,
      },
      data: dataToUpdate,
    });

    prismadb.$disconnect();

    return NextResponse.json(updatedOwner);
  } catch (error) {
    console.error("[OWNER_PATCH]", error);
    return new NextResponse("Internal error.", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { userId: string; ownerId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.userId;
    const role = session?.user?.role;

    if (!userId || !params.ownerId || params.userId !== userId) {
      return new NextResponse("Unauthenticated.", { status: 403 });
    }

    if (role !== "admin") {
      return new NextResponse("Unauthorized.", { status: 401 });
    }

    const owner = await prismadb.user.findUnique({
      where: {
        userId: params.ownerId,
      },
      include: {
        ownerRestaurants: true,
      },
    });

    if (!owner) {
      return new NextResponse("Owner not found.", { status: 404 });
    }

    // Disconnect owner from restaurants
    for (const restaurant of owner.ownerRestaurants) {
      await prismadb.restaurant.update({
        where: {
          restaurantId: restaurant.restaurantId,
        },
        data: {
          owners: {
            disconnect: {
              userId: params.ownerId,
            },
          },
        },
      });
    }

    // Delete the owner
    await prismadb.user.delete({
      where: {
        userId: params.ownerId,
      },
    });

    prismadb.$disconnect();
    return new NextResponse("Owner deleted successfully.", { status: 200 });
  } catch (error) {
    console.log("[OWNER_DELETE]", error);
    return new NextResponse("Internal error.", { status: 500 });
  }
}
