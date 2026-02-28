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
    <>
      <div className="flex h-16 px-4 justify-between items-center border-b">
        <div className="flex space-x-4 items-center  ">
          <div>
            <StoreDropdown items={stores} />
          </div>
          <div className="">
            <MainNav />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <ThemeButton />
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </>
  );
};

export default Navbar;
