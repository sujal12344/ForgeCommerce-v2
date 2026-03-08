import prisma from "@/prisma/client";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthenticated", { status: 403 });
  }

  const { storeId } = await params;
  if (!storeId) {
    return new NextResponse("Store id is required", { status: 400 });
  }

  const storeByUserId = await prisma.store.findFirst({
    where: { id: storeId, userId },
  });

  if (!storeByUserId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { dataObj } = await req.json();
    if (!dataObj || typeof dataObj !== "object") {
      return new NextResponse("Data object is required", { status: 400 });
    }

    const addColors = await prisma.color.createMany({
      data: Object.entries(dataObj).map(([key, value]) => {
        if (typeof value !== "string") {
          throw new Error(`Invalid color value for "${key}": expected string`);
        }
        return {
          name: key,
          value: String(value),
          storeId,
        };
      }),
    });

    return NextResponse.json(addColors);
  } catch (error) {
    console.error("[MULTIPLE_COLORS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
