import prisma from "@/prisma/client";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ storeId: string }> },
) {
  try {
    let nameArr: unknown;
    try {
      const body = await req.json();
      nameArr = body.nameArr;
    } catch (error) {
      return new NextResponse("Invalid JSON body", { status: 400 });
    }
    const { userId } = await auth();
    const { storeId } = await params;
    if (!Array.isArray(nameArr) || nameArr.length === 0) {
      return new NextResponse("nameArr must be a non-empty array", {
        status: 400,
      });
    }
    if (
      !nameArr.every(
        (name) => typeof name === "string" && name.trim().length > 0,
      )
    ) {
      return new NextResponse("All names must be non-empty strings", {
        status: 400,
      });
    }
    if (!storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    });
    if (!store) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const getBills = await prisma.billBoard.findMany({
      where: {
        storeId,
      },
    });

    if (!getBills.length) {
      return new NextResponse("No billboards found for this store", {
        status: 400,
      });
    }
    const billIdsMap = getBills.map((bill) => bill.id);
    const addCategories = await prisma.category.createManyAndReturn({
      data: nameArr.map((name: string, index: number) => ({
        name: name.trim(),
        storeId,
        billboardId: billIdsMap[index % billIdsMap.length], // Assign a billboard ID in a round-robin fashion
      })),
    });
    // console.log(addCategories);
    return NextResponse.json({ 
      success: true, 
      count: addCategories.length, 
    });
  } catch (error) {
    console.error("[MULTIPLE_CATEGORIES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
