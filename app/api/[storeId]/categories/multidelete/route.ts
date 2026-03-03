import prisma from "@/prisma/client";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  // console.log(params);
  const { userId } = await auth();
  let idsArr: unknown;
  try {
    const body = await req.json();
    idsArr = body.idsArr;
  } catch {
    return NextResponse.json("Invalid request body", { status: 400 });
  }

  const { storeId } = await params;

  if (
    !Array.isArray(idsArr) ||
    idsArr.length === 0 ||
    !idsArr.every(id => typeof id === "string" && id.trim().length > 0)
  ) {
    return NextResponse.json("Invalid or empty idsArr", { status: 400 });
  }
  const validIds: string[] = (idsArr as string[])
    .map(id => id.trim())
    .filter(id => id.length > 0);
  if (!userId || !storeId) {
    return NextResponse.json("Unauthorized", { status: 401 });
  }

  const Isvalid = await prisma.store.findFirst({
    where: {
      id: storeId,
      userId,
    },
  });

  if (!Isvalid) {
    return NextResponse.json("Unauthorized", { status: 403 });
  }

  try {
    const deletedCategories = await prisma.category.deleteMany({
      where: {
        id: { in: validIds },
        storeId,
      },
    });

    if (deletedCategories.count === 0) {
      return NextResponse.json("No categories deleted", { status: 404 });
    }
    return NextResponse.json(deletedCategories);
  } catch (error) {
    console.error("[CATEGORIES_MULTIDELETE]", error);
    return NextResponse.json("Internal server error", { status: 500 });
  }
}
