import getGraphdata from "@/components/overview-actions/get-graphdata";
import getProducts from "@/components/overview-actions/get-products";
import getRevenue from "@/components/overview-actions/get-revenue";
import getSales from "@/components/overview-actions/get-sales";
import getUserinfo from "@/components/overview-actions/get-userinfo";
import { dataExists } from "@/components/sample-actions/data-exists";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import DashboardClient from "./components/dashboard-client";

const Dashboard = async ({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) => {
  const { storeId } = await params;

  // Server-side prefetch → hydrates client instantly (no "Preparing awesomeness…" on repeat visits)
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["dashboard", storeId],
    queryFn: async () => {
      const [sales, availProducts, totalRevenue, graphData, salesData, dataExist] =
        await Promise.all([
          getSales(storeId),
          getProducts(storeId),
          getRevenue(storeId),
          getGraphdata(storeId),
          getUserinfo(storeId),
          dataExists(storeId),
        ]);
      return { sales, availProducts, totalRevenue, graphData, salesData, dataExist };
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardClient storeId={storeId} />
    </HydrationBoundary>
  );
};

export default Dashboard;
