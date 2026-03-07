import { NextResponse } from "next/server";

// Credentials are now NEXT_PUBLIC_ env vars read directly by the client component.
// This route is kept for backwards compatibility but returns no sensitive data.
export async function GET() {
  return NextResponse.json(
    {
      message:
        "Use NEXT_PUBLIC_DEMO_USER_EMAIL / NEXT_PUBLIC_DEMO_USER_PASSWORD env vars",
    },
    { status: 410 }
  );
}
