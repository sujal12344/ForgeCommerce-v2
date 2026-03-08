"use client";

import SampleDataModal from "@/components/quick-adds/sample-data";
import FillStoreButton from "@/components/quick-adds/sample-data-fill";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Heading from "@/components/ui/heading";
import OverviewGraph from "@/components/ui/overview-graph";
import Sales from "@/components/ui/recent-sales";
import { Separator } from "@/components/ui/separator";
import { DEMO_STORE_ID, DEMO_STORE_URL } from "@/lib/constants";
import { formatter } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import {
  CreditCardIcon,
  DollarSignIcon,
  ExternalLinkIcon,
  ShirtIcon,
  ShoppingCartIcon,
  TrendingUpIcon,
} from "lucide-react";
import Link from "next/link";

interface DashboardData {
  sales: number | null;
  availProducts: number | null;
  totalRevenue: number | null;
  graphData: { name: string; total: number }[] | null;
  salesData:
    | {
        id: string;
        name: string;
        email: string;
        pricePaid: number;
      }[]
    | null;
  dataExist: boolean | null;
}

// Skeleton card shown during first hydration
function StatSkeleton() {
  return (
    <Card className="border border-border/50 bg-card/80">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="h-3 w-24 rounded bg-muted animate-pulse" />
        <div className="size-9 rounded-xl bg-muted animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="h-7 w-20 rounded bg-muted animate-pulse mb-2" />
        <div className="h-3 w-32 rounded bg-muted animate-pulse" />
      </CardContent>
    </Card>
  );
}

export default function DashboardClient({ storeId }: { storeId: string }) {
  const { data, isLoading, isError, error } = useQuery<DashboardData>({
    queryKey: ["dashboard", storeId],
    queryFn: () =>
      fetch(`/api/${storeId}/dashboard`).then(r => {
        if (!r.ok) throw new Error("Failed to fetch dashboard data");
        return r.json();
      }),
    staleTime: 60 * 1000,
  });

  const {
    sales,
    availProducts,
    totalRevenue,
    graphData,
    salesData,
    dataExist,
  } = data ?? {};

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center gap-2">
        <p className="text-destructive font-semibold">
          Failed to load dashboard
        </p>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error
            ? error.message
            : "An unexpected error occurred"}
        </p>
      </div>
    );
  }

  return (
    <div className="px-3 py-3 sm:px-4 sm:py-4 md:px-6 lg:px-8 w-full space-y-4 sm:space-y-6">
      {/* ── Header ── */}
      <div className="flex gap-2 items-center justify-between">
        <div className="space-y-0.5">
          <Heading title="Dashboard" description="Overview of your store" />
        </div>

        <div className="flex flex-wrap gap-1 sm:gap-2 items-center">
          {!isLoading && !dataExist && (
            <>
              <FillStoreButton storeId={storeId} />
              <SampleDataModal />
            </>
          )}

          {storeId === DEMO_STORE_ID && (
            <Link href={DEMO_STORE_URL} target="_blank">
              <Button
                size="sm"
                className="bg-linear-to-r transition-all duration-300 from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 hover:scale-105 hover:shadow-lg text-white flex items-center gap-1.5 p-4"
              >
                <ShoppingCartIcon className="size-3.5" />
                <span className="hidden sm:inline">View</span> Store
                <ExternalLinkIcon className="size-3.5" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      <Separator />

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full gap-3 sm:gap-4">
        {isLoading ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : (
          <>
            {/* Revenue */}
            <div className="group">
              <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-border/50 bg-card/80">
                <div className="absolute -top-6 -right-6 h-28 w-28 rounded-full bg-green-500/10 blur-2xl pointer-events-none" />
                <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 relative">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Total Revenue
                  </CardTitle>
                  <div className="size-8 sm:size-10 rounded-xl bg-linear-to-br from-green-400 to-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm shadow-green-500/25">
                    <DollarSignIcon className="size-4 sm:size-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-xl sm:text-2xl font-bold tracking-tight text-green-500">
                    {totalRevenue !== null && totalRevenue !== undefined
                      ? formatter.format(totalRevenue)
                      : "$0.00"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <TrendingUpIcon className="size-3 text-green-500" />
                    From paid orders
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Sales */}
            <div className="group">
              <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-border/50 bg-card/80">
                <div className="absolute -top-6 -right-6 h-28 w-28 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />
                <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 relative">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Total Sales
                  </CardTitle>
                  <div className="size-8 sm:size-10 rounded-xl bg-linear-to-br from-blue-400 to-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm shadow-blue-500/25">
                    <CreditCardIcon className="size-4 sm:size-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-xl sm:text-2xl font-bold tracking-tight text-blue-500">
                    +{sales ?? 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <TrendingUpIcon className="size-3 text-blue-500" />
                    Completed orders
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Products */}
            <div className="group">
              <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-border/50 bg-card/80">
                <div className="absolute -top-6 -right-6 h-28 w-28 rounded-full bg-purple-500/10 blur-2xl pointer-events-none" />
                <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 relative">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1">
                    Products in Stock
                  </CardTitle>
                  <div className="size-8 sm:size-10 rounded-xl bg-linear-to-br from-purple-400 to-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm shadow-purple-500/25">
                    <ShirtIcon className="size-4 sm:size-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-xl sm:text-2xl font-bold tracking-tight text-purple-500">
                    {availProducts ?? 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <TrendingUpIcon className="size-3 text-purple-500" />
                    Available items
                  </p>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>

      {/* ── Analytics ── */}
      <div>
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Performance Analytics
          </p>
          <div className="flex-1 h-px bg-border/50" />
        </div>
        <div className="grid lg:grid-cols-6 gap-3 sm:gap-4 items-stretch mt-3">
          {isLoading ? (
            <>
              <div className="lg:col-span-4">
                <Card className="border border-border/50 bg-card/80 h-full flex flex-col">
                  <CardHeader className="pb-4">
                    <div className="h-4 w-32 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-44 rounded bg-muted animate-pulse mt-1" />
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="h-48 w-full rounded bg-muted animate-pulse" />
                  </CardContent>
                </Card>
              </div>
              <div className="lg:col-span-2">
                <Card className="border border-border/50 bg-card/80 h-full">
                  <CardHeader className="pb-4">
                    <div className="h-4 w-28 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-36 rounded bg-muted animate-pulse mt-1" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-muted animate-pulse shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3 w-24 rounded bg-muted animate-pulse" />
                          <div className="h-2.5 w-32 rounded bg-muted animate-pulse" />
                        </div>
                        <div className="h-3 w-14 rounded bg-muted animate-pulse" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <>
              <div className="lg:col-span-4 transition-all duration-300 h-full sm:hover:scale-[1.005]">
                <OverviewGraph data={graphData ?? null} />
              </div>
              <div className="flex flex-col lg:col-span-2 transition-all duration-300 sm:hover:scale-[1.005]">
                <Sales data={salesData ?? null} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
