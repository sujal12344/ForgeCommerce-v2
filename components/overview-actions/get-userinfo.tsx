import prisma from "@/prisma/client";

export default async function getUserinfo(storeId: string) {
  if (!storeId) return null;

  const userInfo = await prisma.order.findMany({
    where: {
      storeId,
      isPaid: true,
    },
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  const userData = userInfo.map((order) => ({
    id: order.id,
    name: order.name,
    email: order.email,
    pricePaid: order.orderItems.reduce((total, item) => {
      return total + (item.product?.price.toNumber() ?? 0);
    }, 0),
  }));
  if (userData.length === 0) return null;

  return userData;
}
