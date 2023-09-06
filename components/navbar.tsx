import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prismadb from "@/lib/prismadb";
import MainNav from "./main-nav";
import { Button } from "@/components/ui/button";

const Navbar = async () => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.userId;
  const role = session?.user?.role;
  if (!userId && role === "user") {
    redirect("/api/auth/signin");
  }

  return (
    <div className="border-b">
      <div className="flex h-16 w-full items-center px-8 space-x-4 justify-between">
        <MainNav className="text-bold" />
        <Link rel="preload" href={`/api/auth/signout`}>
          <Button variant="destructive">Sign Out</Button>
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
