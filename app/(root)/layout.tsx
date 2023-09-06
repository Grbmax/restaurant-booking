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

  const restaurant = await prismadb.restaurant.findFirst({
    where: {
      userId,
    },
  });
  if (restaurant && role !== "user") {
    // console.log(restaurant)
    redirect(`/${userId}`);
  }

  return <>{children}</>;
}
