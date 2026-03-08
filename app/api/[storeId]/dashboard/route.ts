import getGraphdata from "@/components/overview-actions/get-graphdata";
import getProducts from "@/components/overview-actions/get-products";
import getRevenue from "@/components/overview-actions/get-revenue";
import getSales from "@/components/overview-actions/get-sales";
import getUserinfo from "@/components/overview-actions/get-userinfo";
import { dataExists } from "@/components/sample-actions/data-exists";
import prisma from "@/prisma/client";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { storeId } = await params;

  const store = await prisma.store.findFirst({
    where: { id: storeId, userId },
  });
  if (!store) return new NextResponse("Forbidden", { status: 403 });

  try {
    const [
      sales,
      availProducts,
      totalRevenue,
      graphData,
      salesData,
      dataExist,
    ] = await Promise.all([
      getSales(storeId),
      getProducts(storeId),
      getRevenue(storeId),
      getGraphdata(storeId),
      getUserinfo(storeId),
      dataExists(storeId),
    ]);

    return NextResponse.json({
      sales,
      availProducts,
      totalRevenue,
      graphData,
      salesData,
      dataExist,
    });
  } catch (err) {
    console.error("[DASHBOARD_GET]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
