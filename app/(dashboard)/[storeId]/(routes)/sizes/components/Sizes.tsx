"use client";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import { PlusIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React from "react";

import SampleDataModalSizes from "@/components/quick-adds/sample-data-sizes";
import { Separator } from "@/components/ui/separator";
import axios from "axios";
import toast from "react-hot-toast";
import ApiList from "../../../../../../components/ui/api-list";
import { DataTable } from "../../../../../../components/ui/data-table";
import { SizesColumn, columns } from "./column";

type SizesProps = {
  SizesData: SizesColumn[];
};

const Sizes = ({ SizesData }: SizesProps) => {
  const router = useRouter();
  const params = useParams();
  const { storeId } = params;
  const [sizes, setSizes] = React.useState<SizesColumn[]>(SizesData);

  React.useEffect(() => {
    setSizes(SizesData);
  }, [SizesData]);

  const onDeleteSelected = async (ids: string[]) => {
    try {
      // console.log(ids, "ids deleted");
      const res = await axios.delete(`/api/${storeId}/sizes/multidelete`, {
        data: { idsArr: ids },
      });
      // console.log(res, "res");
      setSizes(prev => prev.filter(item => !ids.includes(item.id)));
      router.refresh();
      toast.success("Sizes deleted successfully");
      return { success: true };
    } catch (err) {
      // console.log(err);
      toast.error(
        "Check if the sizes attached to products are deleted and try again"
      );
      return {
        success: false,
        error:
          "Check if the sizes attached to products is deleted and try again",
      };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <Heading
          title={`Sizes (${sizes.length})`}
          description="Create and manage product sizes"
        />
        <div className="flex items-center gap-2">
          <SampleDataModalSizes />
          <Button
            onClick={() => router.push(`/${storeId}/sizes/new`)}
            className="gap-x-1.5 bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white hover:scale-105 transition-all duration-200 shadow-sm"
          >
            <PlusIcon className="size-3.5 sm:size-4" />
            New Size
          </Button>
        </div>
      </div>
      <Separator />
      <DataTable
        onDeleteSelected={onDeleteSelected}
        searchKey="name"
        columns={columns}
        data={sizes}
      />
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            API Reference
          </p>
          <div className="flex-1 h-px bg-border/50" />
        </div>
        <ApiList Entityname="sizes" EntityIdname="sizeId" />
      </div>
    </div>
  );
};

export default Sizes;
