import prisma from "@/prisma/client";

export async function categoriesExist(storeId: string) {
  if (!storeId) return null;

  const count = await prisma.category.count({
    where: {
      storeId,
    },
  });

  return count >= 3 ? true : false;
}
