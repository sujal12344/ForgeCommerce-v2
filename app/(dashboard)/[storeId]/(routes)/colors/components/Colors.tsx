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
    <>
      <div className="flex items-center justify-between">
        <div>
          <Heading
            title={`Colors(${Colors.length})`}
            description="Create and manage Colors"
          />
        </div>
        <div className="flex items-center justify-center space-x-2">
          <SampleDataModalColors />
          <Button
            onClick={() => {
              router.push(`/${storeId}/colors/new`);
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
        searchKey="name"
        columns={columns}
        data={Colors}
      />
      <div className="w-full mt-10 ml-2">
        <Heading
          title={"Api"}
          description="APIs to connect frontend and backend"
        />
        <Separator />
        <ApiList Entityname="colors" EntityIdname="{colorId}" />
      </div>
    </>
  );
};

export default Colors;
