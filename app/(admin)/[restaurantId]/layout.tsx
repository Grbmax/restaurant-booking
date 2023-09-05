import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { CustomSession } from "@/types";
import prismadb from "@/lib/prismadb";
import Navbar from "@/components/navbar";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { restaurantId: string };
}) {
  const { userId, role } = (await getServerSession(
    authOptions
  )) as CustomSession;

  if (!userId || role !== "admin") {
    redirect("/api/auth/signin");
  }

  const restaurant = await prismadb.restaurant.findFirst({
    where: {
      restaurantId: params.restaurantId,
      userId,
    },
  });

  if (!restaurant) {
    redirect("/");
  }

  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
