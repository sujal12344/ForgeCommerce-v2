import Navbar from "@/components/modals-and-nav/Navbar";
import prisma from "@/prisma/client";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function StoreIdLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ storeId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const { storeId } = await params;
  const IsStore = await prisma.store.findFirst({
    where: {
      id: storeId,
      userId,
    },
  });
  if (!IsStore) redirect("/");
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
