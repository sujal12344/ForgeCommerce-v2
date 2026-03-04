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
      userId,
    },
  });

  if (FindStoreInfo) {
    return (
      <div className="flex flex-col">
        <div className="flex-1 py-6 px-8">
          <SettingsPage name={FindStoreInfo.name} id={FindStoreInfo.id} />
        </div>
      </div>
    );
  }
  redirect("/");
}
