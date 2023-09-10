"use client";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { redirect, useParams, usePathname } from "next/navigation";

const MainNav = ({
  className,
  role,
  name,
  ...props
}: React.HTMLAttributes<HTMLElement> & { role: string | undefined } & {
  name: string | undefined;
}) => {
  const pathname = usePathname();
  const params = useParams();

  let routes = [
    {
      href: `/${params.userId}`,
      label: `${name}`,
      active: pathname === `/${params.userId}`,
    },

    {
      href: `/${params.userId}/restaurants`,
      label: "Restaurants",
      active: pathname === `/${params.userId}/restaurants`,
    },

    {
      href: `/${params.userId}/bookings`,
      label: "Bookings",
      active: pathname === `/${params.userId}/bookings`,
    },
  ];

  if (role === "admin") {
    routes = [
      {
        href: `/${params.userId}`,
        label: `${name}`,
        active: pathname === `/${params.userId}`,
      },

      {
        href: `/${params.userId}/restaurants`,
        label: "Restaurants",
        active: pathname === `/${params.userId}/restaurants`,
      },
      {
        href: `/${params.userId}/owners`,
        label: "Owners",
        active: pathname === `/${params.userId}/owners`,
      },

      {
        href: `/${params.userId}/bookings`,
        label: "Bookings",
        active: pathname === `/${params.userId}/bookings`,
      },
    ];
  }

  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)}>
      {routes.map((route) => (
        <Link
          rel="preload"
          key={route.href}
          href={route.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            route.active
              ? "text-black dark:text-white"
              : "text-muted-foreground"
          )}
        >
          {route.label}
        </Link>
      ))}
    </nav>
  );
};

export default MainNav;
