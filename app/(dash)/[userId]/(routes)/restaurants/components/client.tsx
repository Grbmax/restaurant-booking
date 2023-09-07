"use client";
import { useParams, useRouter } from "next/navigation";

import { RestaurantColumn, columns } from "./column";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { useSession } from "next-auth/react";

interface RestaurantClientProps {
  data: RestaurantColumn[];
}

export const RestaurantClient: React.FC<RestaurantClientProps> = ({ data }) => {
  const router = useRouter();
  const params = useParams();

  const { data: session, status } = useSession();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Restaurants (${data.length})`}
          description="Manage your restaurants."
        />
          <Button
            onClick={() => router.push(`/${params.userId}/restaurants/new`)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New
          </Button>
      </div>
      <Separator />
      <DataTable columns={columns} data={data} searchKey="name" />
    </>
  );
};
