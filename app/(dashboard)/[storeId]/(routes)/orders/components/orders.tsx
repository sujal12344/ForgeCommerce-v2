"use client";
import { DataTable } from "@/components/ui/data-table";
import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import axios from "axios";
import { useParams } from "next/navigation";
import React from "react";
import { OrderColumn, columns } from "./column";

type OrdersProps = {
  OrdersData: OrderColumn[];
};

const Orders = ({ OrdersData }: OrdersProps) => {
  const [orders, setOrders] = React.useState<OrderColumn[]>(OrdersData);
  const params = useParams();
  const { storeId } = params;

  const onDeleteSelected = async (ids: string[]) => {
    if (!storeId) {
      return { success: false, error: "Store ID is missing" };
    }

    try {
      await axios.delete(`/api/${storeId}/orders/multidelete`, {
        data: { idsArr: ids },
      });
      setOrders(prev => prev.filter(item => !ids.includes(item.id)));
      return { success: true };
    } catch (error) {
      console.error("Failed to delete orders:", error);
      return {
        success: false,
        error:
          "Failed to delete orders. Please ensure no dependent records exist and try again.",
      };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <Heading
          title={`Orders (${orders.length})`}
          description="View and manage customer orders"
        />
      </div>
      <Separator />
      <DataTable
        onDeleteSelected={onDeleteSelected}
        searchKey="product"
        columns={columns}
        data={orders}
        isOrder={true}
      />
    </div>
  );
};

export default Orders;
