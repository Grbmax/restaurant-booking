"use client";
import { useParams, useRouter } from "next/navigation";

import { BookingColumn, columns } from "./column";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { BookingTable } from "@/components/ui/booking-table";
import { Role } from "@/types/next-auth";
import { ApiList } from "@/components/ui/api-list";

interface BookingClientProps {
  data: BookingColumn[];
  role: Role | undefined;
}

export const BookingClient: React.FC<BookingClientProps> = ({
  data,
  role,
}) => {
  const router = useRouter();
  const params = useParams();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Bookings (${data.length})`}
          description="Manage your bookings."
        />
        { role === "admin" &&
          <Button
            onClick={() => router.push(`/${params.userId}/bookings/new`)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New
          </Button>
        }
      </div>
      <Separator />
      <BookingTable columns={columns} data={data} searchKey="username" />
      <Heading title="API Endpoints" description="API calls for bookings"/>
      <Separator />
      <ApiList entityName="bookings" entityIdName="bookingId" />
    </>
  );
};
