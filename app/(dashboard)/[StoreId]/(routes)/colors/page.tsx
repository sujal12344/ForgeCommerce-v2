import prisma from "@/prisma/client";
import Colors from "./components/Colors";

const ColorsPage = async ({ params }: { params: Promise<{ storeId: string }> }) => {
  const { storeId } = await params;
  const FindColors = await prisma.color.findMany({
    where: {
      storeId,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const FilteredData = FindColors.map((color) => ({
    id: color.id,
    name: color.name,
    value: color.value,
    createdAt: color.createdAt.toDateString(),
  }));
  return (
    <div className="flex flex-col">
      <div className="flex-1 py-6 px-8">
        <Colors ColorsData={FilteredData} />
      </div>
    </div>
  );
};

export default ColorsPage;
