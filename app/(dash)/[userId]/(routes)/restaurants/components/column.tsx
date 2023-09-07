"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";

export type RestaurantColumn = {
  restaurantId: string;
  name: string;
  isActive: boolean;
  createdAt: string;
};

export const columns: ColumnDef<RestaurantColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
  {
    accessorKey: "isActive",
    header: "isActive",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
