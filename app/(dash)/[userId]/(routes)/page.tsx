import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prismadb from "@/lib/prismadb";
import { getServerSession } from "next-auth";

const DashboardPage = async ({
  params,
}: {
  params: { userId: string };
}) => {
  const session = await getServerSession(authOptions);
//   const userId = session?.user?.userId;

  return (
    <div>
      <div>Dashboard!</div>
    </div>
  );
};

export default DashboardPage;
