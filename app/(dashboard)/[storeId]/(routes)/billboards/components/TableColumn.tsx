"use client";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import CellActions from "./Cell-Actions";

export type FilteredDataProps = {
  id: string;
  label: string;
  createdAt: string;
  imageUrl: string;
};

export const columns: ColumnDef<FilteredDataProps>[] = [
  {
    accessorKey: "label",
    header: "Label",
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
      return (
        <Image src={data.imageUrl} alt={data.label} width={70} height={70} />
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <CellActions data={row.original} />,
  },
];
