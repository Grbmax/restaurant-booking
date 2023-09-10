import { redirect } from "next/navigation";
import { User } from "@prisma/client";
import { getServerSession } from "next-auth";
import { format } from "date-fns";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { OwnerClient } from "./components/client";
import { OwnerColumn } from "./components/column";

const OwnersPage = async ({ params }: { params: { userId: string } }) => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.userId;
  const role = session?.user?.role;

  let owners: User[] = [];
  if (params.userId !== userId || role === "user" || !userId) {
    redirect("/api/auth/signin");
  } else if (role === "admin") {
  } else if (role === "owner") {
  }

  const formattedOwners: OwnerColumn[] = owners.map((item) => ({
    userId: item.userId,
    name: item.name,
    email: item.email,
    createdAt: format(item.createdAt, "tt dd MMMM yy")
  }))

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        {owners && <OwnerClient data={formattedOwners} role={role} />}
      </div>
    </div>
  );
};

export default OwnersPage;
