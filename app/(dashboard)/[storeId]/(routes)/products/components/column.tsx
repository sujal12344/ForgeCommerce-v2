"use client";
import { ColumnDef } from "@tanstack/react-table";
import CellActions from "./Cell-Actions";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type FilteredDataProps = {
  id: string;
  name: string;
  price: string;
  archived: boolean;
  featured: boolean;
  categoryname: string;
  size: string;
  color: string;
  createdAt: string;
  description?: string;
  ytURL?: string;
};

export const columns: ColumnDef<FilteredDataProps>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "archived",
    header: "Archived",
  },
  {
    accessorKey: "featured",
    header: "Featured",
  },
  {
    accessorKey: "price",
    header: "Price",
  },
  {
    accessorKey: "size",
    header: "Size",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "ytURL",
    header: "YouTube URL",
  },
  {
    accessorKey: "categoryname",
    header: "Category",
  },
  {
    accessorKey: "color",
    header: "Color",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div
          className="size-5 sm:size-6 rounded-full border shrink-0"
          style={{ backgroundColor: row.original.color }}
        />
        <span>{row.original.color}</span>
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },

  {
    id: "actions",
    cell: ({ row }) => <CellActions data={row.original} />,
  },
];
