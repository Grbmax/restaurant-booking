"use client"
import { useParams, useRouter } from "next/navigation";

import { RestaurantColumn } from "./column";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface RestaurantClientProps {
  data: RestaurantColumn[];
}

export const RestaurantClient: React.FC<RestaurantClientProps> = ({ data }) => {
  const router = useRouter();
  const params = useParams();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Restaurants (${data.length})`}
          description="Manage your restaurants."
        />
        <Button onClick={() => router.push(`/${params.userId}/restaurants/new`)}>
            <Plus className="mr-2 h-4 w-4" />
            Add New
        </Button>
      </div>
      <Separator />
    </>
  );
};
