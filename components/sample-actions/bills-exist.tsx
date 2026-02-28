import prisma from "@/prisma/client";

export async function billsExist(storeId: string) {
  if (!storeId) return null;

  const count = await prisma.billBoard.count({
    where: {
      storeId,
    },
  });

  return count >= 3 ? true : false;
}
