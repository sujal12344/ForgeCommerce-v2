/**
 * CLI seed script — runs via `npx prisma db seed`
 * Wipes the demo store and re-populates it with fresh randomised sample data.
 *
 * Do NOT import this file anywhere in the app.
 * Use `loadSampleData` from `./sample-data` instead.
 */
import "dotenv/config";
import { DEMO_STORE_ID, DEMO_STORE_NAME } from "../lib/constants";
import prisma from "./client";
import { loadSampleData } from "./sample-data";

const userId = process.env.DEMO_USER_ID || "user_37TghqIwElaGZ6C4qze8iWq1ZbU";

async function run() {
  console.log("🌱 Starting database seed...");

  // Wipe existing demo store (cascade deletes all related data)
  await prisma.store.deleteMany({ where: { id: DEMO_STORE_ID } }).catch(() => {});
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
