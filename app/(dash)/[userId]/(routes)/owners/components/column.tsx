"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";

export type OwnerColumn = {
  userId: string;
  restaurantName: string;
  userName: string;
  email: string;
  date: string;
  time: string;
};

export const columns: ColumnDef<OwnerColumn>[] = [
  {
    accessorKey: "restaurantName",
    header: "Restaurant",
  },
  {
    accessorKey: "userName",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email ID",
  },
  {
    accessorKey: "time",
    header: "Time",
  },
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
