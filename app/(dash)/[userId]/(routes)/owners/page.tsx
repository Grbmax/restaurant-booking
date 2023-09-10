import { redirect } from "next/navigation";
import { User } from "@prisma/client";
import { getServerSession } from "next-auth";
import { format } from "date-fns";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { OwnerClient } from "./components/client";
import { OwnerColumn } from "./components/column";
import prismadb from "@/lib/prismadb";

const OwnersPage = async ({ params }: { params: { userId: string } }) => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.userId;
  const role = session?.user?.role;

  if (params.userId !== userId || role !== "admin" || !userId) {
    redirect("/api/auth/signin");
  }

  const restaurantsManaged = await prismadb.restaurant.findMany({
    where: {
      adminId: userId
    },
    include: {
      owners: true
    }
  });

  const formattedOwners: OwnerColumn[] = restaurantsManaged.flatMap((restaurant) =>
    restaurant.owners.map((owner) => ({
      userId: owner.userId,
      restaurantName: restaurant.name,
      userName: owner.name,
      email: owner.email,
      time: format(owner.createdAt, "hh:mma"),
      date: format(owner.createdAt, "dd/MM/yy")
    }))
  );

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <OwnerClient data={formattedOwners}/>
      </div>
    </div>
  );
};

export default OwnersPage;
