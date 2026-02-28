import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // TODO: Implement authentication, authorization, and multidelete logic
  return NextResponse.json(
   { error: "Not implemented" },
    { status: 501 }
  );
}