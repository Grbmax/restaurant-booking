"use client";

import * as z from "zod";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Trash } from "lucide-react";

import { Restaurant } from "@prisma/client";
import { AlertModal } from "@/components/modals/alert-modal";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Name should be longer than a character.",
  }),
//   imageUrl: z.string().min(1),
});

type RestaurantFormValues = z.infer<typeof formSchema>;

interface RestaurantFormProps {
  initialData: Restaurant | null;
}

export const RestaurantForm: React.FC<RestaurantFormProps> = ({
  initialData,
}) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? "Edit Restaurant" : "Create Restaurant";
  const description = initialData
    ? "Edit a Restaurant"
    : "Create a new Restaurant";
  const toastMessage = initialData
    ? "Restaurant Updated."
    : "Restaurant Created.";
  const action = initialData ? "Save changes" : "Create";

  const { data: session, status } = useSession();
  if (status === "authenticated") {
    const role = session.user?.role;
    const userId = session.user?.userId;
  }

  const form = useForm<RestaurantFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
        name: '',
        imageUrl: ''
    }
  })

  const onSubmit = async (data: RestaurantFormValues) => {
    try {
        setLoading(true);
        if (initialData) {
            await axios.patch(`/api/${params.userId}/restaurants/${params.restaurantId}`, data)
        } else {
            await axios.post(`/api/${params.userId}/restaurants`, data)
        }
        router.refresh() //Refresh Server Data
        router.push(`/${params.userId}/restaurants`)
        toast.success(toastMessage)
    } catch (error) {
        toast.error("Something went wrong.")
    } finally {
        setLoading(false)
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(
        `/api/${params.userId}/restaurants/${params.restaurantId}`
      );
      router.refresh();
      toast.success("Restaurant deleted.");
    } catch (error) {
      console.log(error);
      toast.error(
        "Make sure you have removed all images, tables, and bookings associated first."
      );
    } finally {
      setLoading(false);
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
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
            size="sm"
            onClick={() => {
              setOpen(true);
            }}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
                    <FormField
                        control={form.control}
                        name="imageUrl"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Restaurant Images</FormLabel>
                                <FormControl>
                                    {/* TODO: Image Upload */}
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-3 gap-8">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input disabled={loading} placeholder="Restaurant Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <Button disabled={loading} type="submit">
                        {action}
                    </Button>
                </form>
      </Form>
    </>
  );
};
