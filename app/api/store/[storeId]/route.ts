import prisma from "@/prisma/client";
import { Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json("Unauthorized", { status: 401 });

    const { updatedname } = await req.json();
    if (!updatedname)
      return NextResponse.json("Name is required", { status: 400 });

    const { storeId } = await params;
    if (!storeId)
      return NextResponse.json("Store ID is required", { status: 400 });

    const updatedStore = await prisma.store.update({
      where: {
        userId,
        id: storeId,
      },
      data: {
        name: updatedname,
      },
    });

    return NextResponse.json(updatedStore);
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return NextResponse.json("Store not found", { status: 404 });
    }
    console.error("[STORE_PATCH]", err);
    return NextResponse.json("Internal server error", { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json("Unauthorized", { status: 401 });

    const { storeId } = await params;
    if (!storeId)
      return NextResponse.json("Store ID is required", { status: 400 });

    const deletedStore = await prisma.store.delete({
      where: {
        userId,
        id: storeId,
      },
    });

    return NextResponse.json(deletedStore);
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return NextResponse.json("Store not found", { status: 404 });
    }
    console.error("[STORE_DELETE]", err);
    return NextResponse.json("Internal server error", { status: 500 });
  }
}
