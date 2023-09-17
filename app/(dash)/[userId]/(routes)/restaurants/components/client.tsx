"use client";
import { useParams, useRouter } from "next/navigation";

import { RestaurantColumn, columns } from "./column";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { Role } from "@/types/next-auth";
import { ApiList } from "@/components/ui/api-list";

interface RestaurantClientProps {
  data: RestaurantColumn[];
  role: Role | undefined;
}

export const RestaurantClient: React.FC<RestaurantClientProps> = ({
  data,
  role,
}) => {
  const router = useRouter();
  const params = useParams();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Restaurants (${data.length})`}
          description="Manage your restaurants."
        />
        {role === "admin" && (
          <Button
            onClick={() => router.push(`/${params.userId}/restaurants/new`)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New
          </Button>
        )}
      </div>
      <Separator />
      <DataTable columns={columns} data={data} searchKey="name" />
      <Heading title="API Endpoints" description="API calls for restaurants"  />
      <Separator />
      <ApiList entityName="restaurants" entityIdName="restaurantId" />
    </>
  );
};
