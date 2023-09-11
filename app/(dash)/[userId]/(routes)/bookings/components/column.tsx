"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

export type BookingColumn = {
  bookingId: string;
  isActive: boolean;
  restaurant: string;
  username: string;
  numPeople: number;
  isFinished: boolean;
  createdAt: string;
  numTablesBooked: number;
};

export const columns: ColumnDef<BookingColumn>[] = [
  {
    accessorKey: "restaurant",
    header: "Restaurant",
  },
  {
    accessorKey: "createdAt",
    header: "Time & Date",
  },
  {
    accessorKey: "username",
    header: "Name",
  },
  {
    accessorKey: "numPeople",
    header: "PAX",
  },
  {
    accessorKey: "numTablesBooked",
    header: "Tables",
  },
  {
    accessorKey: "isActive",
    header: "Confirmed",
  },
  {
    accessorKey: "isFinished",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Completed
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
