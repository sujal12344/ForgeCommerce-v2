import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Creates a short-lived sign-in token server-side (uses secret key → trusted).
// Client uses strategy:"ticket" to avoid Clerk's needs_client_trust block.
export async function GET() {
  const userId = process.env.DEMO_USER_ID;
  if (!userId) {
    return NextResponse.json(
      { error: "DEMO_USER_ID env var not set" },
      { status: 500 }
    );
  }

  try {
    const client = await clerkClient();
    const { token } = await client.signInTokens.createSignInToken({
      userId,
      expiresInSeconds: 60,
    });
    return NextResponse.json({ token });
  } catch {
    return NextResponse.json(
      { error: "Failed to create sign-in token" },
      { status: 500 }
    );
  }
}
