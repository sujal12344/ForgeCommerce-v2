import prisma from "@/prisma/client";

export async function dataExists(storeId: string) {
  if (!storeId) return null;

  const [bills, categories, colors, sizes] = await Promise.all([
    prisma.billBoard.count({ where: { storeId } }),
    prisma.category.count({ where: { storeId } }),
    prisma.color.count({ where: { storeId } }),
    prisma.size.count({ where: { storeId } }),
  ]);
  return bills >= 3 && categories >= 3 && colors >= 3 && sizes >= 3
    ? true
    : false;
}
