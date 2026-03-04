import prisma from "@/prisma/client";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import MainNav from "./MainNav";
import StoreDropdown from "./StoreDropdown";
import { ThemeButton } from "./theme-button";

const Navbar = async () => {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const stores = await prisma.store.findMany({
    where: {
      userId: userId,
    },
  });

  return (
    <div className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="flex h-16 px-4 md:px-6 justify-between items-center">
        <div className="flex items-center gap-4">
          <StoreDropdown items={stores} />
          <div className="hidden sm:block w-px h-5 bg-border/60" />
          <MainNav />
        </div>
        <div className="flex items-center gap-3">
          <ThemeButton />
          <div className="w-px h-5 bg-border/60" />
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
