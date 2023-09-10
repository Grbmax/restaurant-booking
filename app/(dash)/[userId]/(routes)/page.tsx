import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Heading } from "@/components/ui/heading";

const DashboardPage = async ({
  params,
}: {
  params: { userId: string };
}) => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.userId;
  if(params.userId !== userId || !userId) redirect ('/api/auth/signin')

  const title = `Welcome ${session.user?.name}`
  const description = `Logged in as ${session.user?.role} from ${session.user?.email}`

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <Heading
      title={title}
      description={description}
      />
    </div>
  );
};

export default DashboardPage;
