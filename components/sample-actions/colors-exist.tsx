import prisma from "@/prisma/client";

export async function colorsExist(storeId: string) {
  if (!storeId) return 0;

  const count = await prisma.color.count({
    where: {
      storeId,
    },
  });

  return count;
}
