"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import React from "react";

const MainNav = ({
  className,
  ...props
}: React.HtmlHTMLAttributes<HTMLElement>) => {
  const params = useParams();
  const { storeId } = params;
  const pathname = usePathname();

  const routes = [
    {
      href: `/${storeId}`,
      label: "Dashboard",
      active: pathname === `/${storeId}`,
    },
    {
      href: `/${storeId}/billboards`,
      label: "Billboards",
      active: pathname === `/${storeId}/billboards`,
    },
    {
      href: `/${storeId}/categories`,
      label: "Categories",
      active: pathname === `/${storeId}/categories`,
    },
    {
      href: `/${storeId}/colors`,
      label: "Colors",
      active: pathname === `/${storeId}/colors`,
    },
    {
      href: `/${storeId}/sizes`,
      label: "Sizes",
      active: pathname === `/${storeId}/sizes`,
    },
    {
      href: `/${storeId}/products`,
      label: "Products",
      active: pathname === `/${storeId}/products`,
    },
    {
      href: `/${storeId}/orders`,
      label: "Orders",
      active: pathname === `/${storeId}/orders`,
    },
    {
      href: `/${storeId}/settings`,
      label: "Settings",
      active: pathname === `/${storeId}/settings`,
    },
  ];
  return (
    <>
      <ul className={cn("flex items-center space-x-4 lg:space-x-6", className)}>
        {routes.map((route) => (
          <li key={route.href}>
            <Link
              className={cn(
                "font-medium text-sm transition-colors hover:text-primary dark:text-white ",
                route.active
                  ? "text-black dark:text-white"
                  : "text-muted-foreground",
              )}
              href={route.href}
            >
              {route.label}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
};

export default MainNav;
