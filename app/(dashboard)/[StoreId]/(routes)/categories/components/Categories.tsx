"use client";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import SampleDataModalCat from "@/components/quick-adds/sample-data-cat";
import { Separator } from "@/components/ui/separator";
import axios from "axios";
import ApiList from "../../../../../../components/ui/api-list";
import { DataTable } from "../../../../../../components/ui/data-table";
import { CategoryColumn, columns } from "./column";

type CategoriesProps = {
  CategoriesData: CategoryColumn[];
};

const Categories = ({ CategoriesData }: CategoriesProps) => {
  const router = useRouter();
  const params = useParams();
  const { storeId } = params;
  const [categories, setCategories] = useState(CategoriesData);
  const onDeleteSelected = async (ids: string[]) => {
    try {
      console.log(ids, "ids deleted");
      const res = await axios.delete(`/api/${storeId}/categories/multidelete`, {
        data: { idsArr: ids },
      });
      console.log(res, "res");
      setCategories((prevCategories) =>
        prevCategories.filter((category) => !ids.includes(category.id)),
      );
      return { success: true };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        error:
          "Check if the category attached to products is deleted and try again",
      };
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <Heading
            title={`Categories(${categories.length})`}
            description="Create and manage Categories"
          />
        </div>
        <div className="flex items-center justify-center space-x-2">
          <SampleDataModalCat />
          <Button
            onClick={() => {
              router.push(`/${storeId}/categories/new`);
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
        data={categories}
      />
      <div className="w-full mt-10 ml-2">
        <Heading
          title={"Api"}
          description="APIs to connected frontend and backend"
        />
        <Separator />
        <ApiList Entityname="categories" EntityIdname="{categoryId}" />
      </div>
    </>
  );
};

export default Categories;
