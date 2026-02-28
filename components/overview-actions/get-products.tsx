import prisma from "@/prisma/client";

export default async function getProducts(storeId: string) {
  if (!storeId) return null;
  return prisma.product.count({
    where: {
      storeId,
      archived: false,
    },
  });
}
