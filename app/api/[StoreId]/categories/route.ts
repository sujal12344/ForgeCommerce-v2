import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/prisma/client";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ storeId: string }> },
) {
  try {
    const { userId } = await auth();

    const { name, billboardId } = await req.json();

    const { storeId } = await params;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!billboardId) {
      return new NextResponse("Billboard ID is required", { status: 400 });
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

    const billboard = await prisma.billBoard.findFirst({
      where: {
        id: billboardId,
        storeId,
      },
    });

    if (!billboard) {
      return new NextResponse("Billboard not found in this store", { status: 400 });
    }

    const categories = await prisma.category.create({
      data: {
        name,
        billboardId,
        storeId,
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error creating category:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ storeId: string }> },
) {
  try {
    const { storeId } = await params;
    if (!storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const categories = await prisma.category.findMany({
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

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
