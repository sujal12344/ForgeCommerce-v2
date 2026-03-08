import prisma from "@/prisma/client";

export default async function getRevenue(storeId: string) {
  if (!storeId) return null;

  // Single JOIN query instead of 2 sequential queries
  const orders = await prisma.order.findMany({
    where: { storeId, isPaid: true },
    include: {
      orderItems: {
        include: { product: { select: { id: true, price: true } } },
      },
    },
  });

  const total = orders
    .flatMap(o => o.orderItems)
    .reduce((sum, item) => sum + (item.product?.price.toNumber() ?? 0), 0);

  return total;
}
