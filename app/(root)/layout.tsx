import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import prismadb from "@/lib/prismadb";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.userId;
  const role = session?.user?.role;

  if (!userId) {
    redirect("/api/auth/signin");
  }

  if (role === "admin") {
    const restaurant = await prismadb.restaurant.findFirst({
      where: {
        adminId: userId,
      },
    });
    if (restaurant) {
      console.log(userId)
      redirect(`/${userId}`);
    }
  }

  if (role === "owner") {
    const restaurant = await prismadb.restaurant.findFirst({
      where: {
        owners: {
          some: {
            userId
          }
        }
      },
    });
    if (restaurant) {
      // redirect(`/${userId}`);
    }
  }

  return <>{children}</>;
}
