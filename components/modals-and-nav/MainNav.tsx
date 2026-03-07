"use client";
import { cn } from "@/lib/utils";
import {
  Image,
  LayoutDashboard,
  LucideIcon,
  Package,
  Palette,
  Ruler,
  Settings,
  ShoppingCart,
  Tag,
} from "lucide-react";
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

  const routes: {
    href: string;
    label: string;
    icon: LucideIcon;
    active: boolean;
  }[] = [
    {
      href: `/${storeId}`,
      label: "Dashboard",
      icon: LayoutDashboard,
      active: pathname === `/${storeId}`,
    },
    {
      href: `/${storeId}/billboards`,
      label: "Billboards",
      icon: Image,
      active: pathname === `/${storeId}/billboards`,
    },
    {
      href: `/${storeId}/categories`,
      label: "Categories",
      icon: Tag,
      active: pathname === `/${storeId}/categories`,
    },
    {
      href: `/${storeId}/colors`,
      label: "Colors",
      icon: Palette,
      active: pathname === `/${storeId}/colors`,
    },
    {
      href: `/${storeId}/sizes`,
      label: "Sizes",
      icon: Ruler,
      active: pathname === `/${storeId}/sizes`,
    },
    {
      href: `/${storeId}/products`,
      label: "Products",
      icon: Package,
      active: pathname === `/${storeId}/products`,
    },
    {
      href: `/${storeId}/orders`,
      label: "Orders",
      icon: ShoppingCart,
      active: pathname === `/${storeId}/orders`,
    },
    {
      href: `/${storeId}/settings`,
      label: "Settings",
      icon: Settings,
      active: pathname === `/${storeId}/settings`,
    },
  ];

  return (
    <nav className={cn("flex items-center gap-1", className)} {...props}>
      {routes.map(route => {
        const Icon = route.icon;
        return (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center gap-1 sm:gap-1.5 lg:gap-2 rounded-md px-2 sm:px-2.5 lg:px-3 py-1.5 text-sm font-medium transition-all duration-200",
              "hover:bg-muted hover:text-foreground",
              route.active
                ? "bg-muted text-foreground"
                : "text-muted-foreground"
            )}
          >
            <Icon
              className={cn(
                "h-3.5 w-3.5 shrink-0",
                route.active ? "text-foreground" : "text-muted-foreground/70"
              )}
            />
            <span className="hidden lg:inline">{route.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default MainNav;
