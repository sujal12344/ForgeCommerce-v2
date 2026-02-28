import getGraphdata from "@/components/overview-actions/get-graphdata";
import getProducts from "@/components/overview-actions/get-products";
import getRevenue from "@/components/overview-actions/get-revenue";
import getSales from "@/components/overview-actions/get-sales";
import getUserinfo from "@/components/overview-actions/get-userinfo";
import SampleDataModal from "@/components/quick-adds/sample-data";
import { dataExists } from "@/components/sample-actions/data-exists";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Heading from "@/components/ui/heading";
import OverviewGraph from "@/components/ui/overview-graph";
import Sales from "@/components/ui/recent-sales";
import { Separator } from "@/components/ui/separator";
import { DEMO_STORE_ID, DEMO_STORE_URL } from "@/lib/constants";
import { formatter } from "@/lib/utils";
import {
  CreditCard,
  DollarSign,
  ExternalLink,
  Shirt,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";

const Dashboard = async ({ params }: { params: Promise<{ storeId: string }> }) => {
  const { storeId } = await params;
   const [sales, availProducts, totalRevenue, graphData, salesData, dataExist] =
    await Promise.all([
      getSales(storeId),
      getProducts(storeId),
      getRevenue(storeId),
      getGraphdata(storeId),
      getUserinfo(storeId),
      dataExists(storeId),
    ]);
  return (
    <div className="px-4 py-2 md:px-6 lg:px-8 w-full h-full">
      <div className="flex flex-row justify-between items-center">
        <Heading title="Dashboard" description="Overview of your store" />

        <div className="flex space-x-4 items-center">
          {dataExist ? <></> : <SampleDataModal />}

          {storeId === DEMO_STORE_ID && (
            <Link href={DEMO_STORE_URL} target="_blank">
              <Button className="bg-linear-to-r transition-all duration-300 from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 hover:scale-105 hover:shadow-lg text-white flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">View</span> Store
                <ExternalLink className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          )}
        </div>
      </div>
      <Separator />
      <div className="grid sm:grid-cols-3 w-full gap-6 mt-2 ">
        <div className="group">
          <Card className="transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-l-4 border-l-green-500 dark:border-l-green-400">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <div className="h-10 w-10 rounded-full bg-linear-to-br from-green-400 to-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-linear-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {totalRevenue !== null
                  ? formatter.format(totalRevenue)
                  : "$0.00"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                From paid orders
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="group">
          <Card className="transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-l-4 border-l-blue-500 dark:border-l-blue-400">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <div className="h-10 w-10 rounded-full bg-linear-to-br from-blue-400 to-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                +{sales ?? 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Completed orders
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="group">
          <Card className="transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-l-4 border-l-purple-500 dark:border-l-purple-400">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-1">
                Total products
                <span className="hidden md:inline">(in stock)</span>
              </CardTitle>
              <div className="h-10 w-10 rounded-full bg-linear-to-br from-purple-400 to-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shirt className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {availProducts ?? 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Available items
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="grid lg:grid-cols-6 gap-6 md:mt-12 mt-5">
        <div className="lg:col-span-4 transition-all duration-300 hover:scale-[1.01]">
          <OverviewGraph data={graphData} />
        </div>
        <div className="lg:col-span-2 hidden lg:block transition-all duration-300 hover:scale-[1.01]">
          <Sales data={salesData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
