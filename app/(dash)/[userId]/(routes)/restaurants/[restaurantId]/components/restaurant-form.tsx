"use client";

import * as z from "zod";
import axios from "axios";
import { redirect, useParams, useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Trash } from "lucide-react";

import { Booking, Image, Restaurant, Table } from "@prisma/client";
import { AlertModal } from "@/components/modals/alert-modal";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Name should be longer than a character.",
  }),
  imageUrl: z.string().url({ message: "Invalid URL" }), // Added field for image URLs
  numTables: z.coerce.number().min(1, {
    message: "Number of tables should be at least 1.",
  }),
  tableCapacity: z.coerce.number().min(1, {
    message: "Table capacity should be at least 1.",
  }),
  isActive: z.boolean().default(false).optional(),
});

type RestaurantFormValues = z.infer<typeof formSchema>;

interface RestaurantFormProps {
  initialData:
    | (Restaurant & {
        images: Image[];
        tables: Table[];
        bookings: Booking[];
      })
    | null;
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

  const form = useForm<RestaurantFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      imageUrl: initialData?.images[0]?.url || "",
      numTables: initialData?.tables.length || 0, 
      tableCapacity: initialData?.tables[0]?.capacity || 0,
      isActive: initialData?.isActive || false,
    },
  });

  const onSubmit = async (data: RestaurantFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(
          `/api/${params.userId}/restaurants/${params.restaurantId}`,
          data
        );
      } else {
        await axios.post(`/api/${params.userId}/restaurants`, data);
      }
      router.refresh(); // Refresh Server Data
      router.push(`/${params.userId}/restaurants`);
      toast.success(toastMessage);
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(
        `/api/${params.userId}/restaurants/${params.restaurantId}`
      );
      router.refresh();
      router.push(`/${params.userId}/restaurants`)
      toast.success("Restaurant deleted.");
    } catch (error) {
      console.log(error);
      toast.error("Make sure you have removed all bookings associated first.");
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
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    placeholder="Restaurant Name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="imageUrl" // Updated field name for the image URL
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    placeholder="Image URL"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="numTables"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Tables</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      type="number"
                      min="1"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tableCapacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Table Capacity</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      type="number"
                      min="1"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Is Active</FormLabel>
                  </div>
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
