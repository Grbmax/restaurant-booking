import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prismadb from "@/lib/prismadb";
import { Restaurant } from "@prisma/client";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { RestaurantClient } from "./components/client";

const RestaurantsPage = async ({ params }: { params: { userId: string } }) => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.userId;
  const role = session?.user?.role;

  let restaurants: Restaurant[] = [];
  if (params.userId !== userId || role === "user" || !userId) {
    redirect("/api/auth/signin");
  } else if (role === "admin") {
    restaurants = await prismadb.restaurant.findMany({
      where: {
        adminId: userId,
      },
      include: {
        owners: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  } else if (role === "owner") {
    restaurants = await prismadb.restaurant.findMany({
      where: {
        owners: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        owners: {
          select: {
            userId: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        {restaurants.length !== 0 && <RestaurantClient data={[]}/>}
      </div>
    </div>
  );
};

export default RestaurantsPage;