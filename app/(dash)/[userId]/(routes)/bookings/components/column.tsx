"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";

export type BookingColumn = {
  bookingId: string;
  isActive: boolean;
  restaurantId: string;
  userId: string;
  numPeople: number;
  tableId: string;
  createdAt: string;
};

export const columns: ColumnDef<BookingColumn>[] = [
  {
    accessorKey: "name",
    header: "Restaurant",
  },
  {
    accessorKey: "createdAt",
    header: "Time & Date",
  },
  {
    accessorKey: "userId",
    header: "Name"
  },
  {
    accessorKey: "numPeople",
    header: "PAX"
  },
  {
    accessorKey: "tableId",
    header: "Table Number"
  },
  {
    accessorKey: "isActive",
    header: "Confirmed",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
