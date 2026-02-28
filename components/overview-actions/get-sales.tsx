import prisma from "@/prisma/client";

export default async function getSales(storeId: string) {
  if (!storeId) return null;

  return prisma.order.count({
    where: {
      isPaid: true,
      storeId,
    },
  });
}
