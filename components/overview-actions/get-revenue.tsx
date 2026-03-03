import prisma from "@/prisma/client";

export default async function getRevenue(storeId: string) {
  if (!storeId) return null;

  const orders = await prisma.order.findMany({
    where: {
      storeId,
      isPaid: true,
    },
    include: {
      orderItems: true,
    },
  });
  const orderItems = orders.flatMap(order => order.orderItems);
  const productIds = [
    ...new Set(
      orderItems
        .map(item => item.productId)
        .filter((id): id is string => id !== null)
    ),
  ];

  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
    },
    select: {
      id: true,
      price: true,
    },
  });

  const priceMap = new Map(products.map(p => [p.id, p.price.toNumber()]));

  const total = orderItems.reduce((sum, item) => {
    return sum + (item.productId ? (priceMap.get(item.productId) ?? 0) : 0);
  }, 0);

  return total;
}
