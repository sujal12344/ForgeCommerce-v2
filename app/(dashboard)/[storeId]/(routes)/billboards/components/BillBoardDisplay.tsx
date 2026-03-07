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
  const FilteredData = billboards.map(bill => ({
    label: bill.label,
    createdAt: new Date(bill.createdAt).toDateString(),
    id: bill.id,
    imageUrl: bill.imageUrl,
  }));

  const onDeleteSelected = async (ids: string[]) => {
    try {
      await axios.delete(`/api/${storeIdSafe}/billboards/multidelete`, {
        data: { idsArr: ids },
      });
      setBillboards(prevBillboards =>
        prevBillboards.filter(billboard => !ids.includes(billboard.id))
      );
      return { success: true };
    } catch (err) {
      console.error("Failed to delete billboards:", err);
      return { success: false, error: "Failed to delete billboards" };
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <Heading
          title={`Billboards (${billboards.length})`}
          description="Create and manage store billboards"
        />
        <div className="flex items-center gap-2">
          <SampleDataModalBill />
          <Button
            onClick={() => router.push(`/${storeIdSafe}/billboards/new`)}
            className="gap-x-1.5 bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white hover:scale-105 transition-all duration-200 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            New Billboard
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
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            API Reference
          </p>
          <div className="flex-1 h-px bg-border/50" />
        </div>
        <ApiList Entityname="billboards" EntityIdname="billboardId" />
      </div>
    </div>
  );
};

export default Billboards;
