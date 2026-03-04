"use client";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React from "react";

import SampleDataModalColors from "@/components/quick-adds/sample-data-colors";
import { Separator } from "@/components/ui/separator";
import axios from "axios";
import ApiList from "../../../../../../components/ui/api-list";
import { DataTable } from "../../../../../../components/ui/data-table";
import { ColorsColumn, columns } from "./column";

type ColorsProps = {
  ColorsData: ColorsColumn[];
};

const Colors = ({ ColorsData }: ColorsProps) => {
  const router = useRouter();
  const params = useParams();
  const { storeId } = params;
  const [Colors, setColors] = React.useState<ColorsColumn[]>(ColorsData);
  const onDeleteSelected = async (ids: string[]) => {
    try {
      const res = await axios.delete(`/api/${storeId}/colors/multidelete`, {
        data: { idsArr: ids },
      });
      setColors(prev => prev.filter(item => !ids.includes(item.id)));
      return { success: true };
    } catch (err) {
      console.log(err);
      return {
        success: false,
        error:
          "Check if the colors attached to products are deleted and try again",
      };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Heading
          title={`Colors (${Colors.length})`}
          description="Create and manage product colors"
        />
        <div className="flex items-center gap-2">
          <SampleDataModalColors />
          <Button
            onClick={() => router.push(`/${storeId}/colors/new`)}
            className="gap-x-2 bg-linear-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white hover:scale-105 transition-all duration-200 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            New Color
          </Button>
        </div>
      </div>
      <Separator />
      <DataTable
        onDeleteSelected={onDeleteSelected}
        searchKey="name"
        columns={columns}
        data={Colors}
      />
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            API Reference
          </p>
          <div className="flex-1 h-px bg-border/50" />
        </div>
        <ApiList Entityname="colors" EntityIdname="colorId" />
      </div>
    </div>
  );
};

export default Colors;
