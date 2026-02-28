"use client";
import Heading from "@/components/ui/heading";
import React from "react";
import { useParams } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "../../../../../../components/ui/data-table";
import { OrderColumn, columns } from "./column";
import axios from "axios";

type OrdersProps = {
  OrdersData: OrderColumn[];
};

const Orders = ({ OrdersData }: OrdersProps) => {
  const [Orders, setOrders] = React.useState<OrderColumn[]>(OrdersData);
  const params = useParams();
  const { storeId } = params;

  const onDeleteSelected = async (ids: string[]) => {
    if (!storeId) {
      return { success: false, error: "Store ID is missing" };
    }

    try {
      console.log(ids, "ids deleted");
      const res = await axios.delete(
        `/api/${storeId}/orders/multidelete`,
        {
          data: { idsArr: ids },
        }
      );
      console.log(res, "res");
      setOrders(prev => prev.filter(item => !ids.includes(item.id)));
      return { success: true };
    } catch (err) {
      console.log(err);
      return { success: false, error: "Check if the orders attached to products is deleted and try again" };
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Orders(${Orders.length})`}
          description="Create and manage Orders"
        />
      </div>
      <Separator />
      <DataTable
        onDeleteSelected={onDeleteSelected}
        searchKey="product"
        columns={columns}
        data={Orders}
        isOrder={true}
      />
      <div className="w-full mt-10 ml-2"></div>
    </>
  );
};

export default Orders;
