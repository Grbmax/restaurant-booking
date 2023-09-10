"use client";
import * as z from "zod";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Trash, UtensilsCrossed } from "lucide-react";

import { User } from "@prisma/client";
import { AlertModal } from "@/components/modals/alert-modal";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// Define the form schema and types
const formSchema = z.object({
  name: z.string().min(1, {
    message: "Name should be longer than a character.",
  }),
  email: z.string().email(),
  password: z.string().min(1).max(30, "Password cannot exceed 30 characters"),
  image: z.string().url({ message: "Invalid URL" }),
  role: z.string().min(1),
  restaurantIds: z.array(z.string()).optional(),
});

type OwnerFormValues = z.infer<typeof formSchema>;

// Define the OwnerFormProps interface
interface OwnerFormProps {
  initialData: User | null;
  restaurantsManaged: { restaurantId: string; name: string }[];
  initialRestaurants: { restaurantId: string; name: string }[];
}

// Define the OwnerForm component
export const OwnerForm: React.FC<OwnerFormProps> = ({
  initialData,
  restaurantsManaged,
  initialRestaurants,
}) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>(
    initialRestaurants.map((r) => r.restaurantId) || []
  );

  const title = initialData ? "Edit Owner" : "Create Owner";
  const description = initialData ? "Edit a Owner" : "Create a new Owner";
  const toastMessage = initialData ? "Owner Updated." : "Owner Created.";
  const action = initialData ? "Save changes" : "Create";

  const form = useForm<OwnerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      password: "",
      image: initialData?.image || "",
      role: initialData?.role || "owner",
      restaurantIds: initialRestaurants.map((r) => r.restaurantId) || [],
    },
  });

  const onSubmit = async (data: OwnerFormValues) => {
    try {
      const updatedData = {
        ...data,
        restaurantIds: selectedRestaurants,
      };
      setLoading(true);
      if (initialData) {
        await axios.patch(
          `/api/${params.userId}/owners/${initialData.userId}`,
          updatedData
        );
      } else {
        await axios.post(`/api/${params.userId}/owners`, updatedData);
      }
      router.refresh();
      router.push(`/${params.userId}/owners`);
      toast.success(toastMessage);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.delete(
          `/api/${params.userId}/owners/${initialData.userId}`
        );
      }
      router.push(`/${params.userId}/owners`);
      toast.success("Owner deleted.");
    } catch (error) {
      console.error(error);
      toast.error("Make sure you have removed all bookings associated first.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const handleRestaurantCheckboxChange = (restaurantId: string) => {
    setSelectedRestaurants((prevSelectedRestaurants) => {
      return prevSelectedRestaurants.includes(restaurantId)
        ? prevSelectedRestaurants.filter((id) => id !== restaurantId)
        : [...prevSelectedRestaurants, restaurantId];
    });
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
          className="grid grid-cols-3 gap-8"
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
                    placeholder="Owner Name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input disabled={loading} placeholder="Email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    type="password"
                    placeholder="Password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="restaurantIds"
            render={({ field }) => (
              <FormItem className="grid mt-2">
                <FormLabel>Select Restaurants</FormLabel>
                <FormControl>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild className="w-20">
                      <Button variant="outline">
                        <UtensilsCrossed className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-64">
                      <DropdownMenuLabel>Restaurants</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {restaurantsManaged.map((restaurant) => (
                        <DropdownMenuCheckboxItem
                          key={restaurant.restaurantId}
                          checked={selectedRestaurants.includes(
                            restaurant.restaurantId
                          )}
                          onCheckedChange={() =>
                            handleRestaurantCheckboxChange(
                              restaurant.restaurantId
                            )
                          }
                        >
                          {restaurant.name}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="image"
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
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    placeholder="Role"
                    {...field}
                    value="owner"
                    readOnly
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={loading} type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};

export default OwnerForm;
