import { NextResponse } from "next/server";

import prisma from "@/prisma/client";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ colorId: string; storeId: string }> },
) {
  try {

    const { colorId, storeId } = await params;
    if (!colorId) {
      return new NextResponse("Color id is required", { status: 400 });
    }

    if (!storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const color = await prisma.color.findUnique({
      where: {
        id: colorId,
        storeId,
      },
    });

    if (!color) {
      return new NextResponse("Color not found", { status: 404 });
    }

    return NextResponse.json(color);
  } catch (error) {
    console.log("[COLOR_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ colorId: string; storeId: string }> },
) {
  try {

    const { colorId, storeId } = await params;
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!colorId) {
      return new NextResponse("Color id is required", { status: 400 });
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

    const color = await prisma.color.delete({
      where: {
        id: colorId,
        storeId,
      },
    });

    return NextResponse.json(color);
  } catch (error) {
    console.log("[COLOR_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ colorId: string; storeId: string }> },
) {
  try {
    const { userId } = await auth();

    const { name, value } = await req.json();

    const { colorId, storeId } = await params;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!value) {
      return new NextResponse("Value is required", { status: 400 });
    }

    if (!colorId) {
      return new NextResponse("Color id is required", { status: 400 });
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

    const color = await prisma.color.update({
      where: {
        id: colorId,
        storeId,
      },
      data: {
        name,
        value,
      },
    });

    return NextResponse.json(color);
  } catch (error) {
    console.log("[COLOR_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
