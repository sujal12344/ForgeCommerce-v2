"use client";
import SampleDataModalBill from "@/components/quick-adds/sample-data-bill";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { BillBoard } from "@prisma/client";
import axios from "axios";
import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import ApiList from "../../../../../../components/ui/api-list";
import { DataTable } from "../../../../../../components/ui/data-table";
import { columns } from "./TableColumn";

type billboardsprops = {
  BillboardData: BillBoard[];
};
const Billboards = ({ BillboardData }: billboardsprops) => {
  const router = useRouter();
  const params = useParams();
  const rawStoreId = params.storeId;
  const storeIdSafe = Array.isArray(rawStoreId)
    ? rawStoreId[0]
    : (rawStoreId ?? "");
  const [billboards, setBillboards] = useState(BillboardData);
  const FilteredData = billboards.map((bill) => ({
    label: bill.label,
    createdAt: new Date(bill.createdAt).toDateString(),
    id: bill.id,
    imageUrl: bill.imageUrl,
  }));

  const onDeleteSelected = async (ids: string[]) => {
    try {
      const res = await axios.delete(
        `/api/${storeIdSafe}/billboards/multidelete`,
        {
          data: { idsArr: ids },
        },
      );
      setBillboards((prevBillboards) =>
        prevBillboards.filter((billboard) => !ids.includes(billboard.id)),
      );
      return { success: true };
    } catch (err) {
      console.error("Failed to delete billboards:", err);
      return { success: false, error: "Failed to delete billboards" };
    }
  };
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <Heading
            title={`Billboards(${billboards.length})`}
            description="Create and manage billboards"
          />
        </div>
        <div className="flex items-center justify-center space-x-2">
          <SampleDataModalBill />
          <Button
            onClick={() => {
              router.push(`/${storeIdSafe}/billboards/new`);
            }}
            className="gap-x-2 hover:bg-secondary hover:text-primary"
          >
            <Plus className="h-5 w-4" />
            New
          </Button>
        </div>
      </div>
      <Separator />
      <DataTable
        onDeleteSelected={onDeleteSelected}
        searchKey="label"
        columns={columns}
        data={FilteredData}
      />
      <div className="w-full mt-10 ml-2">
        <Heading
          title={"Api"}
          description="APIs to connect frontend and backend"
        />
        <Separator />
        <ApiList Entityname="billboards" EntityIdname="billboardId" />
      </div>
    </>
  );
};

export default Billboards;
