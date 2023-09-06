import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const DashboardPage = async ({
  params,
}: {
  params: { userId: string };
}) => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.userId;
  if(params.userId !== userId || !userId) redirect ('/api/auth/signin')

  return (
    <div>
      <div>Dashboard!</div>
    </div>
  );
};

export default DashboardPage;
