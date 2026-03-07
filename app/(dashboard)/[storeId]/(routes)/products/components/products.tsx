"use client";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import { PlusIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React from "react";

import { Separator } from "@/components/ui/separator";
import axios from "axios";
import toast from "react-hot-toast";
import ApiList from "../../../../../../components/ui/api-list";
import { DataTable } from "../../../../../../components/ui/data-table";
import { FilteredDataProps, columns } from "./column";

type ProductsProps = {
  ProductsData: FilteredDataProps[];
};

const Products = ({ ProductsData }: ProductsProps) => {
  const router = useRouter();
  const params = useParams();
  const rawStoreId = params.storeId;
  const storeId = Array.isArray(rawStoreId)
    ? rawStoreId[0]
    : (rawStoreId ?? "");
  const [Products, setProducts] =
    React.useState<FilteredDataProps[]>(ProductsData);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const onDeleteSelected = async (ids: string[]) => {
    if (isDeleting)
      return { success: false, error: "Delete already in progress" };
    if (!storeId) return { success: false, error: "Store ID is unavailable" };
    setIsDeleting(true);
    try {
      await axios.delete(`/api/${storeId}/products/multidelete`, {
        data: { idsArr: ids },
      });
      setProducts(prev => prev.filter(item => !ids.includes(item.id)));
      router.refresh();
      toast.success("Products deleted successfully");
      return { success: true };
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete products");
      return { success: false, error: "Something went wrong" };
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <Heading
          title={`Products (${Products.length})`}
          description="Create and manage store products"
        />
        <div>
          <Button
            onClick={() => router.push(`/${storeId}/products/multi-add`)}
            className="gap-x-1.5 bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white hover:scale-105 transition-all duration-200 shadow-sm"
          >
            <PlusIcon className="size-3.5 sm:size-4" />
            New Product
          </Button>
          {/* <Button
          onClick={() => {
            router.push(`/${storeId}/products/new`);
          }}
          className="gap-x-2 hover:bg-secondary hover:text-primary"
        >
          <Plus className="h-5 w-4" />
          New
        </Button> */}
        </div>
      </div>
      <Separator />
      <DataTable
        onDeleteSelected={onDeleteSelected}
        searchKey="name"
        columns={columns}
        data={Products}
      />
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            API Reference
          </p>
          <div className="flex-1 h-px bg-border/50" />
        </div>
        <ApiList Entityname="products" EntityIdname="productId" />
      </div>
    </div>
  );
};

export default Products;
