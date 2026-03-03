import prisma from "@/prisma/client";
import BillBoards from "./components/BillBoardDisplay";

const BillboardPage = async ({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) => {
  const { storeId } = await params;
  const FindBillboards = await prisma.billBoard.findMany({
    where: {
      storeId,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
  return (
    <div className="flex flex-col">
      <div className="flex-1 py-6 px-8">
        <BillBoards BillboardData={FindBillboards} />
      </div>
    </div>
  );
};

export default BillboardPage;
