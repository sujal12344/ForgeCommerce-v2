import prisma from "@/prisma/client";
import ColorForm from "./components/color-form";

const ColorPage = async ({
  params,
}: {
  params: Promise<{ storeId: string; colorId: string }>;
}) => {
  const { storeId, colorId } = await params;
  const color = await prisma.color.findUnique({
    where: {
      id: colorId,
      storeId,
    },
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ColorForm initialData={color} />
      </div>
    </div>
  );
};

export default ColorPage;
