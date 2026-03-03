import { formatter } from "@/lib/utils";
import prisma from "@/prisma/client";
import Orders from "./components/orders";

const OrdersPage = async ({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) => {
  const { storeId } = await params;
  const FindOrders = await prisma.order.findMany({
    where: {
      storeId,
    },
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
  const FilterData = FindOrders.map(order => ({
    id: order.id,
    phone: order.phone,
    isPaid: order.isPaid,
    product: order.orderItems
      .map(item => item.product?.name ?? "Unknown")
      .join(", "),
    address: order.address,
    totalPrice: formatter.format(
      order.orderItems.reduce((total, item) => {
        return total + Number(item.product?.price ?? 0);
      }, 0)
    ),
    createdAt: order.createdAt.toISOString().split("T")[0], // or use date-fns format()
  }));

  return (
    <div className="flex flex-col">
      <div className="flex-1 py-6 px-8">
        <Orders OrdersData={FilterData} />
      </div>
    </div>
  );
};

export default OrdersPage;
