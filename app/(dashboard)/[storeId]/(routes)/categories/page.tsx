import prisma from "@/prisma/client";
import Categories from "./components/Categories";

const CategoriesPage = async ({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) => {
  const { storeId } = await params;
  const FindCategories = await prisma.category.findMany({
    where: {
      storeId,
    },
    include: {
      billboard: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const FilteredData = FindCategories.filter(cat => cat.billboard !== null).map(
    cat => ({
      imageUrl: cat.billboard!.imageUrl,
      id: cat.id,
      name: cat.name,
      billboardLabel: cat.billboard!.label,
      createdAt: cat.createdAt.toLocaleDateString("en-US"),
    })
  );
  return (
    <div className="flex flex-col">
      <div className="flex-1 py-6 px-8">
        <Categories CategoriesData={FilteredData} />
      </div>
    </div>
  );
};

export default CategoriesPage;
