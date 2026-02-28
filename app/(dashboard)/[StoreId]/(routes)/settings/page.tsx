import prisma from "@/prisma/client";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SettingsPage from "./(components)/Settings-page";

export default async function Settings({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;

  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }
  const FindStoreInfo = await prisma.store.findFirst({
    where: {
      id: storeId,
      userId: userId,
    },
  });

  if (FindStoreInfo) {
    return <SettingsPage name={FindStoreInfo.name} id={FindStoreInfo.id} />;
  }
  redirect("/");
}
