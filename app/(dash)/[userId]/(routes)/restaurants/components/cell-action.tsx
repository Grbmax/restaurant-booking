"use client"

import { useParams, useRouter } from "next/navigation"
import { RestaurantColumn } from "./column"

interface CellActionProps {
    data: RestaurantColumn
}

export const CellAction: React.FC<CellActionProps> = ({data}) => {
    const params = useParams();
    const router = useRouter();
    
    return (
        <div>

        </div>
    )
}