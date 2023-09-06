import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prismadb from "@/lib/prismadb";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

const RestaurantsPage = async ({
  params,
}: {
  params: { restaurantId: string };
}) => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.userId;
  const role = session?.user?.role;

  if (role === "user") redirect("/api/auth/signin");

  if (role === "admin") {
    const restaurant = await prismadb.restaurant.findMany({
      where: {
        adminId: userId,
      },
      include: {
        owners: true,
      },
    });
  }

  if (role === "owner") {
    const restaurant = await prismadb.restaurant.findMany({
      where: {
        owners: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        owners: true,
      },
    });
  }

  return (
    <div className="flex">
      <h1 className="text-2xl">Restaurants</h1>
    </div>
  )
};

export default RestaurantsPage;
