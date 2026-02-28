import prisma from "@/prisma/client";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ storeId: string }> },
) {
  const { storeId } = await params;
  const { userId } = await auth();
  let idsArr: string[];
  try {
    const body = await req.json();
    idsArr = body.idsArr;
  } catch (error) {
    return NextResponse.json("Invalid request body", { status: 400 });
  }
  if (!userId || !storeId)
    return NextResponse.json("Unauthorized", { status: 401 });

  if (
    !Array.isArray(idsArr) ||
    idsArr.length === 0 ||
    !idsArr.every((id) => typeof id === "string")
  ) {
    return NextResponse.json("idsArr must be a non-empty array of strings", {
       status: 400,
     });
   }

  const Isvalid = await prisma.store.findFirst({
    where: {
      id: storeId,
      userId,
    },
  });
  if (!Isvalid) return NextResponse.json("Unauthorized", { status: 403 });
  try {
    const deleteResult = await prisma.billBoard.deleteMany({
      where: {
        id: {
          in: idsArr,
        },
        storeId,
      },
    });
    if (deleteResult.count === 0) {
      return NextResponse.json("No billboards found to delete", { status: 404 });
    }
    return NextResponse.json(deleteResult);
  } catch (error) {
    console.error("[BILLBOARDS_MULTIDELETE]", error);
    return NextResponse.json("Internal server error", { status: 500 });
   }
}
