"use client";
import {
  CopyIcon,
  Edit3Icon,
  MoreHorizontalIcon,
  Trash2Icon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { AlertModal } from "../../../../../../components/modals-and-nav/Alert-modal";
import { CategoryColumn } from "./column";
type CellActionsProps = {
  data: CategoryColumn;
};

const CellActions = ({ data }: CellActionsProps) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const params = useParams();
  const rawStoreId = params.storeId;
  const storeId = Array.isArray(rawStoreId)
    ? rawStoreId[0]
    : (rawStoreId ?? "");
  const router = useRouter();
  const HandleEdit = () => {
    router.push(`/${storeId}/categories/${data.id}`);
  };
  const Handledelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${storeId}/categories/${data.id}`);
      toast.success("Category successfully deleted");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };
  return (
    <>
      <AlertModal
        isOpen={open}
        loading={loading}
        onClose={() => {
          setOpen(false);
        }}
        onConfirm={Handledelete}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <span className="sr-only">Open menu</span>
            <MoreHorizontalIcon className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(data.id);
                toast.success("Copied to clipboard");
              } catch {
                toast.error("Failed to copy to clipboard");
              }
            }}
          >
            <CopyIcon className="size-4 mr-2" />
            Copy ID
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => {
              HandleEdit();
            }}
          >
            <Edit3Icon className="size-4 mr-2" />
            <h2> Edit</h2>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-500/10"
            onClick={() => {
              setOpen(true);
            }}
          >
            <Trash2Icon className="size-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default CellActions;
