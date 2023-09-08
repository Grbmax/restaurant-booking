import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { url } from "inspector";

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
    // console.log(body)

    if (params.userId !== userId || !userId || role === "user") {
      return new NextResponse("Unauthenticated.", { status: 401 });
    }

    const { name, imageUrl, numTables, tableCapacity, isActive } = body;

    if (!name) {
      return new NextResponse("Name is required.", { status: 400 });
    }

    if (!imageUrl) {
      return new NextResponse("Image is required.", { status: 400 });
    }

    if (!numTables || !tableCapacity) {
      return new NextResponse("Tables with capacity are required.", { status: 400 });
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

    const restaurantByAdmin = await prismadb.restaurant.findFirst({
      where: {
        restaurantId: params.restaurantId,
        adminId: userId
      }
    })

    if (!restaurantByUserID && !restaurantByAdmin) {
      return new NextResponse("Unauthorized.", { status: 403 });
    }

    // Delete existing images and tables
    await prismadb.image.deleteMany({
      where: {
        restaurantId: params.restaurantId,
      },
    });

    await prismadb.table.deleteMany({
      where: {
        restaurantId: params.restaurantId,
      },
    });

    // Create new images and tables
    await prismadb.image.create({
      data: {
        restaurantId: params.restaurantId,
        url: imageUrl,
      },
    });

    await prismadb.table.createMany({
      data: Array.from({ length: numTables }, () => ({
        capacity: tableCapacity,
        restaurantId: params.restaurantId,
      })),
    });

    // Update restaurant details
    const updatedRestaurant = await prismadb.restaurant.update({
      where: {
        restaurantId: params.restaurantId,
      },
      data: {
        name,
        isActive,
      },
      include: {
        images: true,
        tables: true,
        bookings: true,
      },
    });

    return NextResponse.json(updatedRestaurant);
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

    // Delete all associated images
    await prismadb.image.deleteMany({
      where: {
        restaurantId: params.restaurantId,
      },
    });

    // Delete all associated tables
    await prismadb.table.deleteMany({
      where: {
        restaurantId: params.restaurantId,
      },
    });

    // Check if there are active bookings associated with the restaurant
    const activeBookings = await prismadb.booking.findMany({
      where: {
        restaurantId: params.restaurantId,
        isActive: true,
      },
    });

    if (activeBookings.length > 0) {
      return new NextResponse(
        "Cannot delete restaurant with active bookings.",
        { status: 400 }
      );
    }

    // Delete the restaurant
    const deletedRestaurant = await prismadb.restaurant.deleteMany({
      where: {
        restaurantId: params.restaurantId,
      },
    });

    return NextResponse.json(deletedRestaurant);
  } catch (error) {
    console.log("[RESTAURANT_DELETE]", error);
    return new NextResponse("Internal Error.", { status: 500 });
  }
}
