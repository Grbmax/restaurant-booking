import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Navbar from "@/components/navbar";
import prismadb from "@/lib/prismadb";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { userId: string };
}) {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.userId
  const role = session?.user?.role


  if (!userId || role === "user") {
    redirect("/api/auth/signin");
  }

  if (role === "owner") {
    const restaurant = await prismadb.restaurant.findFirst({
      where: {
        owners: {
          some: {
            userId
          }
        }
      }
    })

    if(!restaurant) {
      redirect(`/api/auth/signin`)
    }
  }

  if (role === "admin") {
    const restaurant = await prismadb.restaurant.findFirst({
      where: {
        adminId: userId
      }
    })
    if(!restaurant) {
      redirect(`/`)
    }
  }

  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
