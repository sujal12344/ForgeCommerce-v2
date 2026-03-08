"use client";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import { PlusIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React from "react";

import SampleDataModalColors from "@/components/quick-adds/sample-data-colors";
import ApiList from "@/components/ui/api-list";
import { DataTable } from "@/components/ui/data-table";
import { Separator } from "@/components/ui/separator";
import axios from "axios";
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
      await axios.delete(`/api/${storeId}/colors/multidelete`, {
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <Heading
          title={`Colors (${Colors.length})`}
          description="Create and manage product colors"
        />
        <div className="flex items-center gap-2">
          <SampleDataModalColors />
          <Button
            onClick={() => router.push(`/${storeId}/colors/new`)}
            className="gap-x-1.5 bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white hover:scale-105 transition-all duration-200 shadow-sm"
          >
            <PlusIcon className="size-3.5 sm:size-4" />
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
