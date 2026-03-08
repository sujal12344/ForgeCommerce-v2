import { NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_req: Request) {
  // TODO: Implement authentication, authorization, and multidelete logic
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
