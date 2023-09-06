import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prismadb from "@/lib/prismadb";
import AuthSignOut from "./auth-signout";
import MainNav from "./main-nav";

const Navbar = async () => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.userId
  const role = session?.user?.role
  if (!userId && role === "user") {
    redirect("/api/auth/signin");
  }


  return (
    <div className="border-b">
      <div className="flex h-16 w-full items-center px-4 space-x-4 justify-between">
        <MainNav className="text-bold" />
        <AuthSignOut />
      </div>
    </div>
  );
};

export default Navbar;
