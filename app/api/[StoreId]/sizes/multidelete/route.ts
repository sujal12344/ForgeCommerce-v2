import prisma from "@/prisma/client";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ storeId: string }> },
) {
  const { userId } = await auth();
  const { storeId } = await params;

  let idsArr: unknown;
  try {
    const body = await req.json();
    idsArr = body.idsArr;
  } catch {
    return NextResponse.json("Invalid JSON body", { status: 400 });
  }

  if (!userId || !storeId)
    return NextResponse.json("Unauthorized", { status: 401 });

  const Isvalid = await prisma.store.findFirst({
    where: {
      id: storeId,
      userId,
    },
  });
  if (!Isvalid) return NextResponse.json("Unauthorized", { status: 403 });

  if (
    !Array.isArray(idsArr) ||
    idsArr.length === 0 ||
    !idsArr.every((id) => typeof id === "string" && id.length > 0)
  ) {
    return NextResponse.json("Invalid or empty idsArr", { status: 400 });
  }

  const validIds: string[] = idsArr;

  const DeleteBill = await prisma.size.deleteMany({
    where: {
      id: {
        in: validIds,
      },
      storeId,
    },
  });
  if (DeleteBill.count === 0)
    return NextResponse.json("Sizes not deleted", { status: 404 });
  return NextResponse.json(DeleteBill);
}
