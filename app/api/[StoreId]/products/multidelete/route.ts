import prisma from "@/prisma/client";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  const { userId } = await auth();
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
  const { storeId } = await params;
  if (!userId || !storeId)
    return NextResponse.json("Unauthorized", { status: 401 });
  const Isvalid = await prisma.store.findFirst({
    where: {
      id: storeId,
      userId,
    },
  });
  if (!Isvalid) return NextResponse.json("Unauthorized", { status: 403 });
  const deletedProducts = await prisma.product.deleteMany({
    where: {
      id: {
        in: idsArr,
      },
      storeId,
    },
  });
  if (deletedProducts.count === 0)
    return NextResponse.json("Products not deleted", { status: 404 });
  return NextResponse.json(deletedProducts);
}
