import prisma from "@/prisma/client";

export async function countSizes(storeId: string) {
  if (!storeId) return 0;

  const sizesCount = await prisma.size.count({
    where: {
      storeId,
    },
  });

  return sizesCount;
}
