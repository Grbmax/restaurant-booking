import { RestaurantForm } from "./components/restaurant-form";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import prismadb from "@/lib/prismadb";

const RestaurantPage = async ({
  params,
}: {
  params: { userId: string; restaurantId: string };
}) => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.userId;
  const role = session?.user?.role;

  if (!userId || params.userId !== userId) {
    redirect("/api/auth/signin");
  }

  let restaurant = null;

  if (role === "admin") {
    restaurant = await prismadb.restaurant.findUnique({
      where: {
        restaurantId: params.restaurantId,
        adminId: userId,
      },
      select: {
        restaurantId: true,
        adminId: true,
        createdAt: true,
        updatedAt: true,
        name: true,
        isActive: true,
        images: true,
        tables: true,
        bookings: true,
      },
    });
  } else if (role === "owner") {
    restaurant = await prismadb.restaurant.findUnique({
      where: {
        restaurantId: params.restaurantId,
        owners: {
          some: {
            userId,
          },
        },
      },
      select: {
        restaurantId: true,
        adminId: true,
        createdAt: true,
        updatedAt: true,
        name: true,
        isActive: true,
        images: true,
        tables: true,
        bookings: true,
      },
    });
  }


  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <RestaurantForm initialData={restaurant} />
      </div>
    </div>
  );
};

export default RestaurantPage;
