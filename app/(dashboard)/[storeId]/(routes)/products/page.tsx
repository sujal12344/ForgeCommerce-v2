import { formatter } from "@/lib/utils";
import prisma from "@/prisma/client";
import Products from "./components/products";

const BillboardPage = async ({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) => {
  const { storeId } = await params;
  const FindProduct = await prisma.product.findMany({
    where: {
      storeId,
    },
    include: {
      category: true,
      color: true,
      size: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
  const filteredData = FindProduct.map(product => ({
    id: product.id,
    name: product.name,
    price: formatter.format(product.price.toNumber()),
    archived: product.archived,
    featured: product.featured,
    categoryname: product.category.name ?? "",
    size: product.size.name ?? "",
    color: product.color.value ?? "",
    description: product.description
      ? product.description.slice(0, 20) + "..."
      : "",
    ytURL: (() => {
      if (!product.ytURL) return "";
      try {
        return new URL(product.ytURL).searchParams.get("v") || "";
      } catch {
        return "";
      }
    })(),
    createdAt: product.createdAt.toLocaleDateString(),
  }));
  return (
    <div className="flex flex-col">
      <div className="flex-1 py-6 px-8">
        <Products ProductsData={filteredData} />
      </div>
    </div>
  );
};

export default BillboardPage;
