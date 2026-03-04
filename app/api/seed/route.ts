import prisma from "@/prisma/client";
import { loadSampleData } from "@/prisma/sample-data";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "You are not authenticated, please sign in." },
        { status: 401 }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { storeId } = body;
    if (!storeId) {
      return NextResponse.json(
        { error: "storeId is required" },
        { status: 400 }
      );
    }

    // Make sure this store belongs to the logged-in user
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    });
    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    await loadSampleData(storeId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[SEED_POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
