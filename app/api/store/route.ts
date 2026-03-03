import prisma from "@/prisma/client";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = await auth();
  let body;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { name } = body;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!name) {
    return NextResponse.json(
      { error: "Store name is required" },
      { status: 400 }
    );
  }

  try {
    const store = await prisma.store.create({
      data: {
        name,
        userId,
      },
    });
    return NextResponse.json(store, { status: 201 });
  } catch (error) {
    console.error("Failed to create store:", error);
    return NextResponse.json(
      { error: "Failed to create store" },
      { status: 500 }
    );
  }
}
