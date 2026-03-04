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
      setCategories(prevCategories =>
        prevCategories.filter(category => !ids.includes(category.id))
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
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Heading
          title={`Categories (${categories.length})`}
          description="Create and manage store categories"
        />
        <div className="flex items-center gap-2">
          <SampleDataModalCat />
          <Button
            onClick={() => router.push(`/${storeId}/categories/new`)}
            className="gap-x-2 bg-linear-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white hover:scale-105 transition-all duration-200 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            New Category
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
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            API Reference
          </p>
          <div className="flex-1 h-px bg-border/50" />
        </div>
        <ApiList Entityname="categories" EntityIdname="categoryId" />
      </div>
    </div>
  );
};

export default Categories;
