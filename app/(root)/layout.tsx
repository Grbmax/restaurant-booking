import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import prismadb from "@/lib/prismadb";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { CustomSession } from "@/types";

export default async function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const session = await getServerSession(authOptions) as CustomSession
  const { userId } = session;
  
  if(!userId) {
    redirect('/api/auth/signin')
  }

  const restaurant = await prismadb.restaurant.findFirst({
    where: {
      userId
    }
  })

  if (restaurant) {
    redirect(`/${restaurant.restaurantId}`)
  }

  return (
    <>
    {children}
    </>
    );
}
