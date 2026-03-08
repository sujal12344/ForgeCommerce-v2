import prisma from "@/prisma/client";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { name } = body;

  if (!name || typeof name !== "string") {
    return NextResponse.json(
      { error: "Store name is required and must be a string" },
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
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "A store with this name already exists" },
          { status: 409 }
        );
      }
    }
    console.error("Failed to create store:", error);
    return NextResponse.json(
      { error: "Failed to create store" },
      { status: 500 }
    );
  }
}
