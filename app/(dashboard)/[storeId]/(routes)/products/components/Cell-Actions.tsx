"use client";
import {
  ArchiveRestoreIcon,
  CopyIcon,
  Edit3Icon,
  MagnetIcon,
  MoreHorizontalIcon,
  Trash2Icon,
} from "lucide-react";

import { AlertModal } from "@/components/modals-and-nav/Alert-modal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { FilteredDataProps } from "./column";
type CellActionsProps = {
  data: FilteredDataProps;
};

const CellActions = ({ data }: CellActionsProps) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const params = useParams();
  const { storeId } = params;
  const router = useRouter();
  const handleEdit = () => {
    router.push(`/${storeId}/products/${data.id}`);
  };
  const handleDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${storeId}/products/${data.id}`);
      toast.success("Product successfully deleted");
      router.refresh();
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };
  const handleFeature = async () => {
    try {
      setLoading(true);
      await axios.patch(`/api/${storeId}/products/${data.id}`, {
        featured: true,
        archived: false,
      });
      toast.success("Product successfully featured");
      router.refresh();
    } catch (error) {
      console.error("Failed to feature product:", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };
  const handleDeFeature = async () => {
    try {
      setLoading(true);
      await axios.patch(`/api/${storeId}/products/${data.id}`, {
        featured: false, //USING FALSE HERE INSTEAD OF TRUE CUZ THE TRUE ONE IS USED IN HANDLEFEATURE SO WE DE-FEATURE A PRODUCT WHEN BOTH ARE FALSE
        archived: false,
      });
      toast.success("Product successfully De-featured");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };
  const handleArchive = async () => {
    try {
      setLoading(true);
      await axios.patch(`/api/${storeId}/products/${data.id}`, {
        archived: true,
        featured: false,
      });
      toast.success("Product successfully archived");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };
  const handleDearchive = async () => {
    try {
      setLoading(true);
      await axios.patch(`/api/${storeId}/products/${data.id}`, {
        archived: false,
        featured: false,
      });
      toast.success("Product successfully dearchived");
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
          <Button variant="ghost" size="icon" disabled={loading}>
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
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <MagnetIcon className="size-4 mr-2" />
              Feature
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="cursor-pointer">
                <DropdownMenuItem
                  onClick={() => {
                    handleFeature();
                  }}
                >
                  Feature
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    handleDeFeature();
                  }}
                >
                  De-Feature
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <ArchiveRestoreIcon className="size-4 mr-2" />
              Archive
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="cursor-pointer">
                <DropdownMenuItem
                  disabled={loading}
                  onClick={handleArchive}
                >
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={loading}
                  onClick={handleDearchive}
                >
                  De-Archive
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default CellActions;
