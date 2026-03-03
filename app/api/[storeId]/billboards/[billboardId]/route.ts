import prisma from "@/prisma/client";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ billboardId: string }> }
) {
  try {
    const { billboardId } = await params;
    if (!billboardId) {
      return NextResponse.json("Billboard ID is required", { status: 400 });
    }

    const billboard = await prisma.billBoard.findUnique({
      where: {
        id: billboardId,
      },
    });

    if (!billboard) {
      return NextResponse.json("Billboard not found", { status: 404 });
    }

    return NextResponse.json(billboard);
  } catch (error) {
    console.error("Error fetching billboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ storeId: string; billboardId: string }> }
) {
  try {
    const { userId } = await auth();

    const { storeId, billboardId } = await params;

    if (!userId) {
      return NextResponse.json("Unauthenticated", { status: 401 });
    }

    if (!storeId || !billboardId) {
      return NextResponse.json("Store ID and Billboard ID are required", {
        status: 400,
      });
    }

    const body = await req.json();
    const { label, imageUrl } = body;

    if (!label || !imageUrl) {
      return NextResponse.json("Label and ImageUrl are required", {
        status: 400,
      });
    }

    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    });

    if (!store) {
      return NextResponse.json("Store not found or unauthorized", {
        status: 404,
      });
    }

    const existingBillboard = await prisma.billBoard.findFirst({
      where: {
        id: billboardId,
        storeId,
      },
    });

    if (!existingBillboard) {
      return NextResponse.json(
        { error: "Billboard not found" },
        { status: 404 }
      );
    }

    const billboard = await prisma.billBoard.update({
      where: {
        id: billboardId,
        storeId,
      },
      data: {
        label,
        imageUrl,
      },
    });

    return NextResponse.json(billboard);
  } catch (error) {
    console.error("Error updating billboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ storeId: string; billboardId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json("Unauthenticated", { status: 401 });
    }

    const { storeId, billboardId } = await params;

    if (!storeId || !billboardId) {
      return NextResponse.json("Store ID and Billboard ID are required", {
        status: 400,
      });
    }

    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    });

    if (!store) {
      return NextResponse.json("Store not found or unauthorized", {
        status: 404,
      });
    }

    const existingBillboard = await prisma.billBoard.findFirst({
      where: {
        id: billboardId,
        storeId,
      },
    });

    if (!existingBillboard) {
      return NextResponse.json(
        { error: "Billboard not found" },
        { status: 404 }
      );
    }

    const billboard = await prisma.billBoard.delete({
      where: {
        id: billboardId,
        storeId,
      },
    });

    return NextResponse.json(billboard);
  } catch (error) {
    console.error("Error deleting billboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
