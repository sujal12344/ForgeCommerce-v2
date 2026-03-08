import prisma from "@/prisma/client";
import SizeForm from "./components/sizes-form";

const SizePage = async ({
  params,
}: {
  params: Promise<{ sizeId: string; storeId: string }>;
}) => {
  const { sizeId, storeId } = await params;
  const size = await prisma.size.findFirst({
    where: {
      id: sizeId,
      storeId,
    },
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SizeForm initialData={size} />
      </div>
    </div>
  );
};

export default SizePage;
