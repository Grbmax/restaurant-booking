import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { userId: string; restaurantId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.userId;
    const role = session?.user?.role;

    if (role === "admin" && params.userId === userId) {
      const restaurants = await prismadb.restaurant.findUnique({
        where: {
          adminId: userId,
          restaurantId: params.restaurantId,
        },
        include: {
          images: true,
          owners: true,
          bookings: true,
          tables: true,
        },
      });
      return NextResponse.json(restaurants);
    }

    if (role === "owner" && params.userId === userId) {
      const restaurants = await prismadb.restaurant.findUnique({
        where: {
          owners: {
            some: {
              userId,
            },
          },
          restaurantId: params.restaurantId,
        },
        include: {
          images: true,
          tables: true,
          bookings: true,
        },
      });
      return NextResponse.json(restaurants);
    }

    const restaurants = await prismadb.restaurant.findUnique({
      where: {
        restaurantId: params.restaurantId,
      },
      select: {
        name: true,
        restaurantId: true,
        images: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return NextResponse.json(restaurants);
  } catch (error) {
    console.log("[RESTAURANT_GET]", error);
    return new NextResponse("Internal Error.", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { userId: string; restaurantId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.userId;
    const role = session?.user?.role;

    const body = await req.json();

    if (params.userId !== userId || !userId || role === "user") {
      return new NextResponse("Unauthenticated.", { status: 401 });
    }

    let { name, images, tables, bookings, isActive } = body;

    if (!name) return new NextResponse("Name is required.", { status: 400 });

    if (!images || !images.length) {
      return new NextResponse("Images are required.", { status: 400 });
    }

    if (!tables || !tables.length) {
      return new NextResponse("Tables are required.", { status: 400 });
    }

    if (!params.restaurantId) {
      return new NextResponse("Restaurant ID required.", { status: 400 });
    }

    const restaurantByUserID = await prismadb.restaurant.findFirst({
      where: {
        restaurantId: params.restaurantId,
        owners: {
          some: {
            userId,
          },
        },
      },
    });

    if (!restaurantByUserID) {
      return new NextResponse("Unauthorized.", { status: 403 });
    }

    await prismadb.restaurant.update({
      where: {
        restaurantId: params.restaurantId,
      },
      data: {
        name,
        isActive,
        images: {
          deleteMany: {},
        },
        tables: {
          deleteMany: {},
        },
        bookings: {
          deleteMany: {},
        },
      },
    });

    const restaurant = await prismadb.restaurant.update({
      where: {
        restaurantId: params.restaurantId,
      },
      data: {
        images: {
          createMany: {
            data: [...images.map((image: { url: string }) => image)],
          },
        },
        tables: {
          createMany: {
            data: [...bookings.map((table: { capacity: string }) => table)],
          },
        },
      },
    });

    if (role === "admin") {
      const { owners } = body;

      if (!owners || !owners.length)
        return new NextResponse("Owners are required.", { status: 400 });
      const restaurantByUserID = await prismadb.restaurant.findFirst({
        where: {
          restaurantId: params.restaurantId,
          adminId: userId,
        },
      });

      if (!restaurantByUserID)
        return new NextResponse("Unauthorized.", { status: 403 });

      await prismadb.restaurant.update({
        where: {
          restaurantId: params.restaurantId,
        },
        data: {
          name,
          isActive,
          images: {
            deleteMany: {},
          },
          tables: {
            deleteMany: {},
          },
          bookings: {
            deleteMany: {},
          },
          owners: {
            deleteMany: {},
          },
        },
      });

      const restaurant = await prismadb.restaurant.update({
        where: {
          restaurantId: params.restaurantId,
        },
        data: {
          images: {
            createMany: {
              data: [...images.map((image: { url: string }) => image)],
            },
          },
          tables: {
            createMany: {
              data: [...bookings.map((table: { capacity: string }) => table)],
            },
          },
          // TODO: Add ability to create owners
          // owners: {
          //   createMany: {
          //     data: [...owners.map((owner: { email: string, passwor }) => table)],
          //   },
          // },
        },
      });

      //ADMIN
    }

    return NextResponse.json(restaurant);
  } catch (error) {
    console.log("[RESTAURANT_PATCH]", error);
    return new NextResponse("Internal Error.", { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { userId: string; restaurantId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.userId;
    const role = session?.user?.role;

    if (params.userId !== userId || !userId || role !== "admin") {
      return new NextResponse("Unauthenticated.", { status: 401 });
    }

    if (!params.restaurantId) {
      return new NextResponse("Restaurant ID required.", { status: 400 });
    }

    const restaurantByUserID = await prismadb.restaurant.findFirst({
      where: {
        restaurantId: params.restaurantId,
        adminId: userId,
      },
    });

    if (!restaurantByUserID) {
      return new NextResponse("Unauthorized.", { status: 403 });
    }

    const restaurant = await prismadb.restaurant.deleteMany({
      where: {
        restaurantId: params.restaurantId,
      },
    });

    return NextResponse.json(restaurant);
  } catch (error) {
    console.log("[RESTAURANT_PATCH]", error);
    return new NextResponse("Internal Error.", { status: 500 });
  }
}
