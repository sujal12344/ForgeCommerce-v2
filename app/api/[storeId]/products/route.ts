import prisma from "@/prisma/client";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ storeId: string }> },
) {
  try {
    const { userId } = await auth();
    const { storeId } = await params;
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
    } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!images || !images.length) {
      return new NextResponse("Images are required", { status: 400 });
    }

    const parsedPrice = typeof price === 'number' ? price : parseFloat(price);
    if (price === undefined || price === null || isNaN(parsedPrice) || parsedPrice < 0) {
      return new NextResponse("Price is required", { status: 400 });
    }

    if (!categoryId) {
      return new NextResponse("Category id is required", { status: 400 });
    }

    if (!colorId) {
      return new NextResponse("Color id is required", { status: 400 });
    }

    if (!sizeId) {
      return new NextResponse("Size id is required", { status: 400 });
    }

    if (!storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        userId: userId,
      },
    });

    if (!store) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        price: parsedPrice,
        featured,
        archived,
        categoryId,
        sizeId,
        colorId,
        storeId,
        images: {
          createMany: {
            data: [...images.map((image: { url: string }) => image)],
          },
        },
        description: description ? description : "",
        ytURL: ytURL || "",
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ storeId: string }> },
) {
  try {    
    const { storeId } = await params;
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId") || undefined;
    const colorId = searchParams.get("colorId") || undefined;
    const sizeId = searchParams.get("sizeId") || undefined;
    const featuredParam = searchParams.get("featured");
    const featured =
      featuredParam === "true"
        ? true
        : featuredParam === "false"
          ? false
          : undefined;
    if (!storeId)
      return new NextResponse("Store id is required", { status: 400 });
    const products = await prisma.product.findMany({
      where: {
        storeId,
        categoryId,
        colorId,
        sizeId,
        featured,
        archived: false,
      },
      include: {
        images: true,
        category: true,
        color: true,
        size: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
