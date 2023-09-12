import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { userId: string } } // Remove bookingId from params
) {
  try {
    const bookings = await prismadb.booking.findMany({
      where: {
        userId: params.userId,
      },
      include: {
        bookedTables: {
          select: {
            tableId: true,
          },
        },
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("BOOKING_GET_ALL", error);
    return new NextResponse("Internal error.", { status: 500 });
  }
}
