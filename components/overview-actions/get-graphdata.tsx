import prisma from "@/prisma/client";

type GraphData = {
  name: string;
  total: number;
};

export default async function getGraphData(storeId: string) {
  if (!storeId) return null;

  const currentYear = new Date().getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);
  const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);

  const paidOrders = await prisma.order.findMany({
    where: {
      storeId,
      isPaid: true,
      createdAt: {
        gte: startOfYear,
        lte: endOfYear,
      },
    },
    include: {
      orderItems: {
        include: {
          product: {
            select: { price: true },
          },
        },
      },
    },
  });
  const monthlyRevenue: { [key: number]: number } = {};
  for (const order of paidOrders) {
    const month = order.createdAt.getMonth();
    let revenueForOrder = 0;
    for (const item of order.orderItems) {
      if (!item.product) continue;
      const quantity = item.quantity ?? 1;
      revenueForOrder += item.product?.price.toNumber() * quantity;
    }
    monthlyRevenue[month] = (monthlyRevenue[month] || 0) + revenueForOrder;
  }

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const data: GraphData[] = monthNames.map((name, index) => ({
    name,
    total: monthlyRevenue[index] || 0,
  }));
  return data;
}
