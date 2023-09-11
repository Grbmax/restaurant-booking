import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const body = await req.json();
    const { date, restaurantId } = body;

    if (!date) {
      return new NextResponse("Date is required.", { status: 403 });
    }

    const numPeople = parseInt(body.numPeople, 10);

    if (isNaN(numPeople)) {
      return new NextResponse("Invalid value for numPeople.", { status: 400 });
    }

    const user = await prismadb.user.findUnique({
      where: {
        userId: params.userId,
      },
    });

    if (!user) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    const restaurant = await prismadb.restaurant.findUnique({
      where: {
        restaurantId,
      },
    });

    if (!restaurant) {
      return new NextResponse("Invalid restaurant ID.", { status: 400 });
    }

    if (!restaurant.isActive) {
      return new NextResponse(
        "Restaurant is currently not accepting bookings.",
        { status: 400 }
      );
    }

    const tableCapacity = await prismadb.table.findFirst({
      where: {
        restaurantId,
      },
      select: {
        capacity: true,
      },
    });

    if (!tableCapacity) {
      return new NextResponse("Table capacity information not available.", {
        status: 500,
      });
    }

    const requiredTables = Math.ceil(numPeople / tableCapacity.capacity);

    const tablesToBook = await prismadb.table.findMany({
      where: {
        restaurantId,
        isBooked: false,
      },
      take: requiredTables,
    });

    if (tablesToBook.length < requiredTables) {
      return new NextResponse("Not enough capacity for this booking.", {
        status: 400,
      });
    }

    const tableIds = tablesToBook.map((table) => table.tableId);

    const createdBooking = await prismadb.booking.create({
      data: {
        date,
        numPeople,
        isActive: true,
        isFinished: false,
        userId: params.userId,
        restaurantId,
        bookedTables: {
          connect: tableIds.map((tableId) => ({ tableId })),
        },
      },
    });

    await prismadb.table.updateMany({
      where: {
        tableId: { in: tableIds },
      },
      data: {
        isBooked: true,
      },
    });

    return NextResponse.json(createdBooking);
  } catch (error) {
    console.log("BOOKING_POST", error);
    return new NextResponse("Internal error.", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { userId: string; bookingId: string } }
) {
  try {
    // Fetch the booking to check if it exists
    const booking = await prismadb.booking.findUnique({
      where: {
        bookingId: params.bookingId,
      },
      include: {
        // Include the associated tables for this booking
        bookedTables: {
          select: {
            tableId: true,
          },
        },
        restaurant: {
          select: {
            adminId: true,
            owners: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      return new NextResponse("Booking not found.", { status: 404 });
    }

    // Check if the user has permission to delete this booking
    const isAuthorized =
      booking.userId === params.userId ||
      booking.restaurant.adminId === params.userId ||
      booking.restaurant.owners.some((owner) => owner.userId === params.userId);

    if (!isAuthorized) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // Check if the current session is valid for admins and owners
    const session = await getServerSession(authOptions);
    if (
      session &&
      (session.user?.role === "admin" || session.user?.role === "owner")
    ) {
      // Continue with the deletion process
      // Update the associated tables to mark them as available (isBooked: false)
      await prismadb.table.updateMany({
        where: {
          tableId: {
            in: booking.bookedTables.map((table) => table.tableId),
          },
        },
        data: {
          isBooked: false,
        },
      });

      // Delete the booking
      await prismadb.booking.delete({
        where: {
          bookingId: params.bookingId,
        },
      });

      return new NextResponse("Booking deleted successfully.", { status: 200 });
    } else {
      return new NextResponse("Unauthorized", { status: 403 });
    }
  } catch (error) {
    console.error("BOOKING_DELETE", error);
    return new NextResponse("Internal error.", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { userId: string; bookingId: string } }
) {
  try {
    const body = await req.json();

    const booking = await prismadb.booking.findUnique({
      where: {
        bookingId: params.bookingId,
      },
      include: {
        bookedTables: {
          select: {
            tableId: true,
          },
        },
        restaurant: {
          select: {
            adminId: true,
            owners: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      return new NextResponse("Booking not found.", { status: 404 });
    }

    if (
      booking.restaurant?.adminId === params.userId ||
      booking.restaurant.owners.some((owner) => owner.userId === params.userId)
    ) {
      const session = await getServerSession(authOptions);
      if (!session || session.user?.role === "user") {
        return new NextResponse("Unauthorized", { status: 403 });
      }

      //ADMIN OR OWNER
      const { isFinished } = body;
      if (isFinished) {
        await prismadb.table.updateMany({
          where: {
            tableId: {
              in: booking.bookedTables.map((table) => table.tableId),
            },
          },
          data: {
            isBooked: false,
          },
        });

        await prismadb.booking.update({
          where: {
            bookingId: params.bookingId,
          },
          data: {
            isFinished: true,
          },
        });
        return new NextResponse("Booking Completed!", { status: 200 })
      } else {
        await prismadb.table.updateMany({
          where: {
            tableId: {
              in: booking.bookedTables.map((table) => table.tableId),
            },
          },
          data: {
            isBooked: true,
          },
        });

        await prismadb.booking.update({
          where: {
            bookingId: params.bookingId,
          },
          data: {
            isFinished: false,
          },
        });
        return new NextResponse("Booking Re-opened!", { status: 200 })
      }
    } else {
      const { date, numPeople } = body;

      if (!date) {
        return new NextResponse("Date is required.", { status: 403 });
      }

      const newNumPeople = parseInt(numPeople, 10);

      if (isNaN(newNumPeople)) {
        return new NextResponse("Invalid value for numPeople.", {
          status: 400,
        });
      }

      if (booking.userId !== params.userId) {
        return new NextResponse("Unauthorized", { status: 403 });
      }

      let dateToUpdate = booking.date;
      let numPeopleToUpdate = booking.numPeople;

      if (date && date !== booking.date && Date.parse(date)) {
        dateToUpdate = date;
      }

      if (numPeople && parseInt(numPeople) !== booking.numPeople) {
        const tableCapacity = await prismadb.table.findFirst({
          where: {
            restaurantId: booking.restaurantId,
          },
          select: {
            capacity: true,
          },
        });

        if (!tableCapacity) {
          return new NextResponse("Table capacity information not available.", {
            status: 500,
          });
        }

        const requiredTables = Math.ceil(newNumPeople / tableCapacity.capacity);

        const availableTables = await prismadb.table.findMany({
          where: {
            restaurantId: booking.restaurantId,
            isBooked: false,
          },
        });

        if (availableTables.length < requiredTables) {
          return new NextResponse("Not enough capacity for this booking.", {
            status: 400,
          });
        }

        const tableIdsToBook = availableTables
          .slice(0, requiredTables)
          .map((table) => table.tableId);

        numPeopleToUpdate = newNumPeople;

        await prismadb.table.updateMany({
          where: {
            tableId: {
              in: [
                ...booking.bookedTables.map((table) => table.tableId),
                ...tableIdsToBook,
              ],
            },
          },
          data: {
            isBooked: true,
          },
        });
      }

      await prismadb.booking.update({
        where: {
          bookingId: params.bookingId,
        },
        data: {
          date: dateToUpdate,
          numPeople: numPeopleToUpdate,
        },
      });

      return new NextResponse("Booking updated successfully.", { status: 200 });
    }
  } catch (error) {
    console.error("BOOKING_PATCH", error);
    return new NextResponse("Internal error.", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { userId: string; bookingId: string } }
) {
  try {
    const booking = await prismadb.booking.findUnique({
      where: {
        userId: params.userId,
        bookingId: params.bookingId,
      },
      include: {
        bookedTables: {
          select: {
            tableId: true,
          },
        },
      },
    });

    if (!booking) {
      return new NextResponse("Booking not found.", { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error("BOOKING_GET", error);
    return new NextResponse("Internal error.", { status: 500 });
  }
}
