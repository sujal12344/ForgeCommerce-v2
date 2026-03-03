import prisma from "@/prisma/client";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    if (!storeId)
      return NextResponse.json(
        { error: "Store Id is required" },
        { status: 400 }
      );
    const FindBillboards = await prisma.billBoard.findMany({
      where: {
        storeId,
      },
    });
    return NextResponse.json(FindBillboards);
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { error: "Failed to fetch billboards" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    const { userId } = await auth();
    const { label, ImageUrl } = await req.json();
    if (!userId)
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    if (!label || !ImageUrl)
      return NextResponse.json(
        { error: "Label and ImageUrl are required" },
        {
          status: 400,
        }
      );
    const IsStorevalid = await prisma.store.findFirst({
      where: {
        userId: userId,
        id: storeId,
      },
    });
    if (!IsStorevalid)
      return NextResponse.json(
        { error: "Store not found or access denied" },
        {
          status: 403,
        }
      );

    const createBill = await prisma.billBoard.create({
      data: {
        label: label,
        imageUrl: ImageUrl,
        storeId,
      },
    });
    return NextResponse.json(createBill, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to create billboard" },
      { status: 500 }
    );
  }
}
