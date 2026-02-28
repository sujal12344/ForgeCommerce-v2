import prisma from "@/prisma/client";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ storeId: string }> },
) {
  let dataObj;
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse("Unauthenticated", { status: 401 });
  }
  try {
    const body = await req.json();
    dataObj = body.dataObj;
  } catch {
    return new NextResponse("Invalid JSON body", { status: 400 });
  }

  if (!dataObj) {
    return new NextResponse("Data object is required", { status: 400 });
  }

  const { storeId } = await params;
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

  if (
    typeof dataObj !== "object" ||
    dataObj === null ||
    Array.isArray(dataObj)
  ) {
    return new NextResponse("Data object must be a valid object", {
      status: 400,
    });
  }

  try {
    const entries = Object.entries(dataObj);

    if (entries.length === 0) {
      return new NextResponse("Data object cannot be empty", { status: 400 });
    }

    const invalidEntry = entries.find(
      ([, value]) => typeof value !== "string" && typeof value !== "number",
    );
    if (invalidEntry) {
      return new NextResponse(
        `Invalid value type for key "${invalidEntry[0]}"`,
        { status: 400 },
      );
    }

    const addSizes = await prisma.size.createMany({
      data: entries.map(([key, value]) => ({
        name: key,
        value: String(value),
        storeId,
      })),
    });

    return NextResponse.json({
      count: addSizes.count,
      message: "Sizes created successfully",
    });
  } catch (error) {
    console.error("[SIZES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
