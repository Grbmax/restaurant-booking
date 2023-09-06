"use client"

import { ColumnDef } from "@tanstack/react-table"

export type RestaurantColumn = {
    restaurantId: string
    name: string
    isActive: boolean
    createdAt: string
}