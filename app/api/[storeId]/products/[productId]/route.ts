import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/prisma/client";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    if (!productId) {
      return new NextResponse("Product id is required", { status: 400 });
    }

    const products = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        images: true,
        category: true,
        size: true,
        color: true,
      },
    });

    if (!products) {
      return new NextResponse("Product not found", { status: 404 });
    }

    return NextResponse.json(products);
  } catch (error) {
    console.log("[PRODUCT_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ productId: string; storeId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    const { productId, storeId } = await params;
    if (!productId) {
      return new NextResponse("Product id is required", { status: 400 });
    }
    if (!storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const storeByUserId = await prisma.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const product = await prisma.product.delete({
      where: {
        id: productId,
        storeId,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCT_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ productId: string; storeId: string }> }
) {
  try {
    const { productId, storeId } = await params;
    const { userId } = await auth();

    const body = await req.json();

    const {
      name,
      price,
      categoryId,
      images,
      colorId,
      sizeId,
      featured,
      archived,
      description,
      ytURL,
    } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!productId) {
      return new NextResponse("Product id is required", { status: 400 });
    }

    if (!storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!images || !images.length) {
      return new NextResponse("Images are required", { status: 400 });
    }

    if (price === undefined || price === null || price === 0) {
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

    const storeByUserId = await prisma.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const products = await prisma.product.update({
      where: {
        id: productId,
        storeId,
      },
      data: {
        name,
        price,
        categoryId,
        colorId,
        sizeId,
        images: {
          deleteMany: {},
          createMany: {
            data: images.map((image: { url: string }) => image),
          },
        },
        featured,
        archived,
        description: description ?? "",
        ytURL: ytURL ?? "",
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.log("[PRODUCT_PUT]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ productId: string; storeId: string }> }
) {
  try {
    const { productId, storeId } = await params;
    const { userId } = await auth();
    let featured, archived;
    try {
      const body = await req.json();
      featured = body.featured;
      archived = body.archived;
    } catch {
      return new NextResponse("Invalid JSON body", { status: 400 });
    }
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }
    if (!productId) {
      return new NextResponse("Product id is required", { status: 400 });
    }
    if (!storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const storeByUserId = await prisma.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }
    const products = await prisma.product.update({
      where: {
        id: productId,
        storeId,
      },
      data: {
        featured,
        archived,
      },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.log("[PRODUCT_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
