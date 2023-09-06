import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prismadb from "@/lib/prismadb";
import { Restaurant } from "@prisma/client";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

const RestaurantsPage = async ({
  params,
}: {
  params: { userId: string };
}) => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.userId;


  const role = session?.user?.role;

  let restaurants: Restaurant[] = [];
  if (role === "user") {
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
        createdAt: 'asc'
      }
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
        createdAt: 'asc'
      }
    });
  }

  return (
    <div className="">
      <h1 className="text-2xl">Restaurants</h1>
      <ul className="flex-col">
        {restaurants.map((restaurant) => {
          return (
            <li>
              {restaurant.name}
            </li>
          )
        })}
      </ul>
    </div>
  );
};

export default RestaurantsPage;
