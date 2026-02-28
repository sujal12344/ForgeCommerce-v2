import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/prisma/client";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ categoryId: string }> },
) {
  try {
    const { categoryId } = await params;
    if (!categoryId) {
      return new NextResponse("Category id is required", { status: 400 });
    }

    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
      include: {
        billboard: true,
      },
    });

    if (!category) {
      return new NextResponse("Category not found", { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ categoryId: string; storeId: string }> },
) {
  try {
    const { categoryId, storeId } = await params;
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!categoryId) {
      return new NextResponse("Category id is required", { status: 400 });
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
      return new NextResponse("Forbidden", { status: 403 });
    }

    const categories = await prisma.category.delete({
      where: {
        id: categoryId,
        storeId,
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error deleting category:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ categoryId: string; storeId: string }> },
) {
  try {
    const { categoryId, storeId } = await params;
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    const body = await req.json();

    const { name, billboardId } = body;

    if (!billboardId) {
      return new NextResponse("Billboard ID is required", { status: 400 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!categoryId) {
      return new NextResponse("Category id is required", { status: 400 });
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
      return new NextResponse("Forbidden", { status: 403 });
    }

    const categories = await prisma.category.update({
      where: {
        id: categoryId,
        storeId,
      },
      data: {
        name,
        billboardId,
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error updating category:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
