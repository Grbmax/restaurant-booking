import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prismadb from "@/lib/prismadb";
import { getServerSession } from "next-auth";

const RestaurantsPage = async ({
  params,
}: {
  params: { restaurantId: string };
}) => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.userId;
  const restaurant = await prismadb.restaurant.findMany({
    where: {
      restaurantId: params.restaurantId,
      userId,
    },
  });
  const name = restaurant[0].name
  return (
    <div>
      <div>Restaurants</div>
      {name}
    </div>
  );
};

export default RestaurantsPage;
