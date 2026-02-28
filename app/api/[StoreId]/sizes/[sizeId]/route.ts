import { NextResponse } from "next/server";

import prisma from "@/prisma/client";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ sizeId: string; storeId: string }> },
) {
  try {
    const { sizeId, storeId } = await params;

    if (!sizeId) {
      return new NextResponse("Size id is required", { status: 400 });
    }

    if (!storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const size = await prisma.size.findUnique({
      where: {
        id: sizeId,
        storeId,
      },
    });

    if (!size) {
      return new NextResponse("Size not found", { status: 404 });
    }

    return NextResponse.json(size);
  } catch (error) {
    console.log("[SIZE_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ sizeId: string; storeId: string }> },
) {
  try {
    const { userId } = await auth();
    const { sizeId, storeId } = await params;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!sizeId) {
      return new NextResponse("Size id is required", { status: 400 });
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

    const sizes = await prisma.size.delete({
      where: {
        id: sizeId,
        storeId,
      },
    });

    return NextResponse.json(sizes);
  } catch (error) {
    console.log("[SIZE_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ sizeId: string; storeId: string }> },
) {
  try {
    const { userId } = await auth();
    const { name, value } = await req.json();
    const { sizeId, storeId } = await params;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!sizeId) {
      return new NextResponse("Size id is required", { status: 400 });
    }

    if (!storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!value) {
      return new NextResponse("Value is required", { status: 400 });
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

    const sizes = await prisma.size.update({
      where: {
        id: sizeId,
        storeId,
      },
      data: {
        name,
        value,
      },
    });

    return NextResponse.json(sizes);
  } catch (error) {
    console.log("[SIZE_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
