import prisma from "@/prisma/client";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  const { storeId } = await params;
  let dataObj;
  try {
    const body = await req.json();
    dataObj = body.dataObj;
  } catch (error) {
    return new NextResponse("Invalid JSON body", { status: 400 });
  }
  const { userId } = await auth();

  // console.log(dataObj);

  if (!dataObj) {
    return new NextResponse("Data object is required", { status: 400 });
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
      userId: userId,
    },
  });

  if (!store) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  if (typeof dataObj !== "object" || Array.isArray(dataObj)) {
    return new NextResponse("Data object must be a plain object", {
      status: 400,
    });
  }

  try {
    const entries = Object.entries(dataObj);

    if (entries.length === 0) {
      return new NextResponse("Data object cannot be empty", { status: 400 });
    }

    if (entries.length > 100) {
      return new NextResponse(
        "Cannot create more than 100 billboards at once",
        { status: 400 }
      );
    }

    const billboardData = entries.map(([key, value]) => ({
      label: key,
      imageUrl: String(value),
      storeId,
    }));

    const addBills = await prisma.billBoard.createMany({
      data: billboardData,
    });

    return NextResponse.json({
      count: addBills.count,
      message: "Billboards created successfully",
    });
  } catch (error) {
    console.error("[MULTIPLE_BILLS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
