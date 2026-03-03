import prisma from "@/prisma/client";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  // console.log(params);
  const { storeId } = await params;
  const { userId } = await auth();

  if (!userId || !storeId) {
    return NextResponse.json("Unauthorized", { status: 401 });
  }

  let idsArr;

  try {
    const body = await req.json();
    idsArr = body.idsArr;
  } catch {
    return NextResponse.json("Invalid JSON body", { status: 400 });
  }

  if (!Array.isArray(idsArr) || idsArr.length === 0) {
    return NextResponse.json("Invalid or empty idsArr", { status: 400 });
  }

  const Isvalid = await prisma.store.findFirst({
    where: {
      id: storeId,
      userId,
    },
  });
  if (!Isvalid) return NextResponse.json("Unauthorized", { status: 403 });
  const DeleteBill = await prisma.color.deleteMany({
    where: {
      id: {
        in: idsArr,
      },
      storeId,
    },
  });
  if (DeleteBill.count === 0) {
    return NextResponse.json("No colors were deleted", { status: 404 });
  }
  return NextResponse.json(DeleteBill);
}
