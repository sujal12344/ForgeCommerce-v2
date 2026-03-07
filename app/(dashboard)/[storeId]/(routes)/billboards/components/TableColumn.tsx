"use client";
import PreviewCell from "@/components/ui/preview-image-cell";
import { ColumnDef } from "@tanstack/react-table";
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
      return <PreviewCell imageUrl={data.imageUrl} label={data.label} />;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <CellActions data={row.original} />,
  },
];
