import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Navbar from "@/components/navbar";

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

  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
