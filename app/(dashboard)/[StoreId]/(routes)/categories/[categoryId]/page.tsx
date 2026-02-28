import prisma from "@/prisma/client";
import { CategoryForm } from "./components/categories-form";

const CategoryPage = async ({
  params,
}: {
  params: Promise<{ categoryId: string; storeId: string }>;
}) => {
  const { categoryId, storeId } = await params;
  const categories = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
  });

  const billboards = await prisma.billBoard.findMany({
    where: {
      storeId,
    },
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CategoryForm billboards={billboards} initialData={categories} />
      </div>
    </div>
  );
};

export default CategoryPage;
