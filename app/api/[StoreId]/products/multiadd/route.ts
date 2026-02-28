import prisma from "@/prisma/client";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

// Prisma type with images relation included
type ProductWithImages = Prisma.ProductGetPayload<{
  include: { images: true };
}>;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ storeId: string }> },
) {
  try {
    const { storeId } = await params;
    const { userId } = await auth();
    let products;
    try {
      products = await req.json();
    } catch {
      return new NextResponse("Invalid JSON payload", { status: 400 });
    }
    console.log("PRODUCTS_BULK_POST", {
      count: Array.isArray(products) ? products.length : 0,
    });
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const StoreByuserId = await prisma.store.findFirst({
      where: {
        id: storeId,
        userId: userId,
      },
    });

    if (!StoreByuserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }
    console.log("PRODUCTS_BULK_POST_AUTHORIZED");

    if (!Array.isArray(products) || products.length === 0) {
      return new NextResponse("Invalid product data", { status: 400 });
    }

    // Validate all products before starting the transaction
    for (const product of products) {
      const { name, images, price, categoryId, colorId, sizeId } = product;
      if (
        !name ||
        !images ||
        !images.length ||
        typeof price !== "number" ||
        price < 0 ||
        !categoryId ||
        !colorId ||
        !sizeId
      ) {
        console.log("PRODUCTS_BULK_POST_INVALID_PRODUCT_DATA", product);
        return new NextResponse(
          "Invalid product data: missing required fields",
          { status: 400 },
        );
      }
    }

    console.log("PRODUCTS_BULK_POST_VALIDATED and PROCESSING");
    const createdProducts = await prisma.$transaction(
      products.map((product: ProductWithImages) => {
        const {
          name,
          price,
          featured,
          archived,
          categoryId,
          sizeId,
          colorId,
          images,
          description,
          ytURL,
        } = product;

        if (
          !name ||
          !images ||
          !images.length ||
          typeof price !== "number" ||
          price < 0 ||
          !categoryId ||
          !colorId ||
          !sizeId
        ) {
          console.log("PRODUCTS_BULK_POST_INVALID_PRODUCT_DATA", product);
          if (!name) console.log("Missing name");
          if (!images || !images.length) console.log("Missing images");
          if (!price) console.log("Missing price");
          if (!categoryId) console.log("Missing categoryId");
          if (!colorId) console.log("Missing colorId");
          if (!sizeId) console.log("Missing sizeId");
          throw new Error("Invalid product data");
        }

        return prisma.product.create({
          data: {
            name,
            price,
            featured,
            archived,
            categoryId,
            sizeId,
            colorId,
            storeId,
            images: {
              createMany: {
                data: images.map((image: { url: string }) => ({
                  url: image.url,
                })),
              },
            },
            description: description || "",
            ytURL: ytURL || "",
          },
        });
      }),
    );
    console.log("PRODUCTS_BULK_POST_COMPLETED and RETURNING and PROCESSING");
    return NextResponse.json(createdProducts);
  } catch (err) {
    console.log("PRODUCTS_BULK_POST", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
