"use client";
import { AlertModal } from "@/components/modals-and-nav/Alert-modal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axios from "axios";
import {
  CopyIcon,
  Edit3Icon,
  MoreHorizontalIcon,
  Trash2Icon,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { SizesColumn } from "./column";
type CellActionsProps = {
  data: SizesColumn;
};

const CellActions = ({ data }: CellActionsProps) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const params = useParams();
  const { storeId } = params;
  const router = useRouter();
  const handleEdit = () => {
    router.push(`/${storeId}/sizes/${data.id}`);
  };
  const handleDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${storeId}/sizes/${data.id}`);
      toast.success("Size successfully deleted");
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
        onConfirm={handleDelete}
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
            onClick={() => {
              navigator.clipboard.writeText(data.id);
              toast.success("copied to clipboard");
            }}
          >
            <CopyIcon className="size-4 mr-2" />
            Copy ID
          </DropdownMenuItem>

          <DropdownMenuItem className="cursor-pointer" onClick={handleEdit}>
            <Edit3Icon className="size-4 mr-2" />
            Edit
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
