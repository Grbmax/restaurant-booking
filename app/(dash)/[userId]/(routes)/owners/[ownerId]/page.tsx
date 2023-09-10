import { OwnerForm } from "./components/owner-form";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import prismadb from "@/lib/prismadb";

const RestaurantPage = async ({
  params,
}: {
  params: { userId: string; ownerId: string };
}) => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.userId;
  const role = session?.user?.role;

  if (!userId || params.userId !== userId || role !== "admin") {
    redirect("/api/auth/signin");
  }

  const owner = await prismadb.user.findUnique({
    where: {
      userId: params.ownerId,
    },
  });

  const restaurantsManaged = await prismadb.restaurant.findMany({
    where: {
      adminId: userId,
    },
    select: {
      restaurantId: true,
      name: true,
    },
  });

  const restaurantsOwned = await prismadb.restaurant.findMany({
    where: {
      owners: {
        some: {
          userId: params.ownerId,
        },
      },
    },
    select: {
      restaurantId: true,
      name: true,
    },
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <OwnerForm
          initialData={owner}
          restaurantsManaged={restaurantsManaged}
          initialRestaurants={restaurantsOwned}
        />
      </div>
    </div>
  );
};

export default RestaurantPage;
