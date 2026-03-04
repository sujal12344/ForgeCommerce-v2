import prisma from "@/prisma/client";
import { format } from "date-fns";
import Sizes from "./components/Sizes";

const SizesPage = async ({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) => {
  const { storeId } = await params;

  const FindSizes = await prisma.size.findMany({
    where: {
      storeId,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const FilteredData = FindSizes.map(size => ({
    id: size.id,
    name: size.name,
    value: size.value,
    createdAt: format(size.createdAt, "MMM d, yyyy"),
  }));
  return (
    <div className="flex flex-col">
      <div className="flex-1 py-6 px-8">
        <Sizes SizesData={FilteredData} />
      </div>
    </div>
  );
};

export default SizesPage;
