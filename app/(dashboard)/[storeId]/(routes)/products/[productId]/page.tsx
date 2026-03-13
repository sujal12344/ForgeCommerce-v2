import prisma from "@/prisma/client";
import { ProductForm } from "./components/product-form";

const ProductIdPage = async ({
  params,
}: {
  params: Promise<{ productId: string; storeId: string }>;
}) => {
  const { productId, storeId } = await params;
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
      storeId,
    },
    include: {
      images: true,
    },
  });

  const serializedProduct = product
    ? {
        ...product,
        price: Number(product.price),
      }
    : null;

  const sizes = await prisma.size.findMany({
    where: {
      storeId,
    },
  });
  const categories = await prisma.category.findMany({
    where: {
      storeId,
    },
  });
  const colors = await prisma.color.findMany({
    where: {
      storeId,
    },
  });
  return (
    <div className="flex flex-col ">
      <div className="flex-1 px-8 py-6">
        <ProductForm
          initialData={serializedProduct}
          colors={colors}
          sizes={sizes}
          categories={categories}
        />
      </div>
    </div>
  );
};

export default ProductIdPage;
