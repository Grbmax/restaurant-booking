"use client";
import axios from "axios";

import { useParams, useRouter } from "next/navigation";
import { BookingColumn } from "./column";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { AlertModal } from "@/components/modals/alert-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Copy, Delete, Edit, MoreHorizontal } from "lucide-react";

interface CellActionProps {
  data: BookingColumn;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("Booking ID copied to the clipboard.");
  };

  const onDelete = async () => {
    try {
      setLoading(true)
      await axios.delete(`/api/${params.userId}/bookings/${data.bookingId}`)
      router.refresh();
      toast.success("Booking deleted.")
    } catch (error) {
      console.log(error)
      toast.error("Make sure you have removed all images, tables, and bookings associated first.");
    } finally {
      setLoading(false)
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            <DropdownMenuLabel>
                Actions
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={() =>(onCopy(data.bookingId))}>
                <Copy className="mr-2 h-4 w-4" />
                Copy ID
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/${params.userId}/bookings/${data.bookingId}`)}>
                <Edit className="mr-2 h-4 w-4" />
                Update
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setOpen(true)}>
                <Delete className="mr-2 h-4 w-4" />
                Delete
            </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
