"use client";
import { useParams, useRouter } from "next/navigation";

import { OwnerColumn, columns } from "./column";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { Role } from "@/types/next-auth";
import { ApiList } from "@/components/ui/api-list";

interface OwnerClientProps {
  data: OwnerColumn[];
}

export const OwnerClient: React.FC<OwnerClientProps> = ({ data }) => {
  const router = useRouter();
  const params = useParams();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Owners (${data.length})`}
          description="Manage your owners."
        />

        <Button onClick={() => router.push(`/${params.userId}/owners/new`)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>
      <Separator />
      <DataTable columns={columns} data={data} searchKey="restaurantName" />
      <Heading title="API Endpoints" description="API calls for owners" />
      <Separator />
      <ApiList entityName="owners" entityIdName="ownerId" />
    </>
  );
};
