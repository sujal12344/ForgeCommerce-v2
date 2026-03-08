/**
 * CLI seed script — runs via `npx prisma db seed`
 * Wipes the demo store and re-populates it with fresh randomised sample data.
 *
 * Do NOT import this file anywhere in the app.
 * Use `loadSampleData` from `./sample-data` instead.
 */
import { DEMO_STORE_ID, DEMO_STORE_NAME } from "@/lib/constants";
import { createClerkClient } from "@clerk/backend";
import "dotenv/config";
import prisma from "./client";
import { loadSampleData } from "./sample-data";

async function run() {
  console.log("🌱 Starting database seed...");

  // auth() only works inside a Next.js request context — not in CLI scripts.
  // Instead, we use Clerk's Backend SDK (uses CLERK_SECRET_KEY) to fetch the
  // first user dynamically — no hardcoding needed.
  const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
  const { data: users } = await clerk.users.getUserList({ limit: 1 });
  const userId = users[0]?.id;

  if (!userId) {
    throw new Error("No users found in Clerk. Please create a user first.");
  }

  // Wipe existing demo store (cascade deletes all related data)
  await prisma.store
    .deleteMany({ where: { id: DEMO_STORE_ID } })
    .catch(() => {});
  console.log("🧹 Cleaned existing demo store.");

  // Re-create the demo store
  await prisma.store.create({
    data: { id: DEMO_STORE_ID, name: DEMO_STORE_NAME, userId },
  });
  console.log("🏪 Demo store created.");

  // Populate with randomised sample data
  await loadSampleData(DEMO_STORE_ID);
  console.log("🌱 Seed completed successfully.");
}

run()
  .catch(e => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
