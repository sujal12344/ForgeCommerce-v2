"use client";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
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
      return data.imageUrl ? (
        <Image src={data.imageUrl} alt={data.name} width={70} height={70} />
      ) : (
        <span className="text-muted-foreground text-sm">No image</span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <CellActions data={row.original} />,
  },
];
