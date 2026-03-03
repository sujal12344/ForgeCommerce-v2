import prisma from "@/prisma/client";
import BillBoardForm from "./components/billboard-form";

const BillBoardId = async ({
  params,
}: {
  params: Promise<{ billboardId: string; storeId: string }>;
}) => {
  const { billboardId, storeId } = await params;
  const billboard = await prisma.billBoard.findFirst({
    where: {
      id: billboardId,
      storeId,
    },
  });
  return (
    <div className="flex flex-col ">
      <div className="flex-1 px-8 py-6">
        <BillBoardForm initialdata={billboard} />
      </div>
    </div>
  );
};

export default BillBoardId;
