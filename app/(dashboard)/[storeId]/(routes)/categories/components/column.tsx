"use client";
import PreviewCell from "@/components/ui/preview-image-cell";
import { ColumnDef } from "@tanstack/react-table";
import CellActions from "./Cell-Actions";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type CategoryColumn = {
  id: string;
  name: string;
  billboardLabel: string;
  createdAt: string;
  imageUrl: string;
};

export const columns: ColumnDef<CategoryColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "billboardLabel",
    header: "Billboard",
  },

  {
    accessorKey: "createdAt",
    header: "Date",
  },
  {
    header: "Preview",
    id: "preview",
    cell: ({ row }) => {
      const data = row.original;
      return <PreviewCell imageUrl={data.imageUrl} label={data.name} />;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <CellActions data={row.original} />,
  },
];
