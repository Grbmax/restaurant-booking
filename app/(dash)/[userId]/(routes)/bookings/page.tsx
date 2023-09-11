import { redirect } from "next/navigation";
import { Booking, Table } from "@prisma/client";
import { getServerSession } from "next-auth";
import { format } from "date-fns";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { BookingClient } from "./components/client";
import { BookingColumn } from "./components/column";
import prismadb from "@/lib/prismadb";

interface ExtendedBooking extends Booking {
  user: {
    name: string;
    email: string;
  };
  restaurant: {
    name: string;
  };
  bookedTables: {
    tableId: string;
  }[]
}

const BookingsPage = async ({ params }: { params: { userId: string } }) => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.userId;
  const role = session?.user?.role;



  let bookings: ExtendedBooking[] = [];

  if (params.userId !== userId || role === "user" || !userId) {
    redirect("/api/auth/signin");
  } else if (role === "admin") {
    bookings = await prismadb.booking.findMany({
      where: {
        restaurant: {
          adminId: userId,
        },
      },
      select: {
        bookingId: true,
        isActive: true,
        date: true,
        numPeople: true,
        isFinished: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        restaurantId: true,
        restaurant: {
          select: {
            name: true,
          },
        },
        bookedTables: {
         select: {
          tableId: true,
         } 
        }
      },
    });
  } else if (role === "owner") {
    bookings = await prismadb.booking.findMany({
      where: {
        restaurant: {
          owners: {
            some: {
              userId: userId,
            },
          },
        },
      },
      select: {
        bookingId: true,
        isActive: true,
        date: true,
        numPeople: true,
        isFinished: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        restaurantId: true,
        restaurant: {
          select: {
            name: true,
          },
        },
        bookedTables: {
          select: {
            tableId: true,
          }
        }                
      },
    });
  }

  const formattedBookings: BookingColumn[] = bookings.map((item) => ({
    bookingId: item.bookingId,
    restaurant: item.restaurant.name,
    isActive: item.isActive,
    username: item.user.name,
    numPeople: item.numPeople,
    isFinished: item.isFinished,
    createdAt: format(item.date, "dd/MM/yy"),
    numTablesBooked: item.bookedTables.length, // Add the number of tables booked
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        {bookings && <BookingClient data={formattedBookings} role={role} />}
      </div>
    </div>
  );
};

export default BookingsPage;
