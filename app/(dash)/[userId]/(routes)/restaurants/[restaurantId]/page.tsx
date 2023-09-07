import prismadb from "@/lib/prismadb";
import { RestaurantForm } from "./components/restaurant-form";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const RestaurantPage = async ({
    params
}: {
    params: { userId: string, restaurantId: string }
}) => {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.userId;
    const role = session?.user?.role;

    if (!userId || params.userId !== userId) {
        console.log("this")
        redirect('/api/auth/signin')
    }

    let restaurant = null;

    if (role === "admin") {
        restaurant = await prismadb.restaurant.findUnique({
            where: {
                restaurantId: params.restaurantId,
                adminId: userId
            }
        })
    } else if (role === "user") {
        restaurant = await prismadb.restaurant.findUnique({
            where: {
                restaurantId: params.restaurantId,
                owners: {
                    some: {
                        userId
                    }
                }
            }
        })
    }

    console.log(restaurant)

    return ( 
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <RestaurantForm initialData={restaurant} />
            </div>
        </div>
     );
}

export default RestaurantPage
