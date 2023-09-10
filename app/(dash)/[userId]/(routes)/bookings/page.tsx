import { redirect } from "next/navigation";
import { Booking } from "@prisma/client";
import { getServerSession } from "next-auth";
import { format } from "date-fns";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { BookingClient } from "./components/client";
import { BookingColumn } from "./components/column";

const BookingsPage = async ({ params }: { params: { userId: string } }) => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.userId;
  const role = session?.user?.role;

  let bookings: Booking[] = [];
  if (params.userId !== userId || role === "user" || !userId) {
    redirect("/api/auth/signin");
  } else if (role === "admin") {
  } else if (role === "owner") {
  }

  const formattedBookings: BookingColumn[] = bookings.map((item) => ({
    bookingId: item.bookingId,
    restaurantId: item.restaurantId,
    isActive: item.isActive,
    userId: item.userId,
    numPeople: item.numPeople,
    tableId: item.tableId,
    createdAt: format(item.createdAt, "tt dd MMMM yy")
  }))

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        {bookings && <BookingClient data={formattedBookings} role={role} />}
      </div>
    </div>
  );
};

export default BookingsPage;
