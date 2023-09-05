import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { CustomSession } from "@/types";
import { redirect } from "next/navigation";
import prismadb from "@/lib/prismadb";

const Navbar = async () => {
  const { userId, role } = (await getServerSession(
    authOptions
  )) as CustomSession;
  if (!userId && role !== "admin") {
    redirect("/api/auth/signin");
  }

  const restaurant = await prismadb.restaurant.findMany({
    where: {
      userId,
    },
  });

  return (
    <div className="border-b">
      <div className="flex h-8 w-full items-center px-4 space-x-4">
        <p>Navbar</p>
        <p>
        {restaurant[0].name}
        </p>
      </div>
    </div>
  );
};

export default Navbar;
