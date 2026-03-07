"use client";
import {
  ArchiveRestore,
  CopyIcon,
  Edit3Icon,
  Magnet,
  MoreHorizontal,
  Trash2,
} from "lucide-react";

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
import { AlertModal } from "../../../../../../components/modals-and-nav/Alert-modal";
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
  const HandleEdit = () => {
    router.push(`/${storeId}/products/${data.id}`);
  };
  const Handledelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${storeId}/products/${data.id}`);
      toast.success("Product successfully deleted");
      router.refresh();
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };
  const HandleFeature = async () => {
    try {
      setLoading(true);
      await axios.patch(`/api/${storeId}/products/${data.id}`, {
        featured: true,
        archived: false,
      });
      toast.success("Product successfully featured");
      router.refresh();
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };
  const HandleDeFeature = async () => {
    try {
      setLoading(true);
      await axios.patch(`/api/${storeId}/products/${data.id}`, {
        featured: false, //USING FALSE HERE INSTEAD OF TRUE CUZ THE TRUE ONE IS USED IN HANDLEFEATURE SO WE DE-FEATURE A PRODUCT WHEN BOTH ARE FALSE
        archived: false,
      });
      toast.success("Product successfully De-featured");
      router.refresh();
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };
  const HandleArchive = async () => {
    try {
      setLoading(true);
      await axios.patch(`/api/${storeId}/products/${data.id}`, {
        archived: true,
        featured: false,
      });
      toast.success("Product successfully archived");
      router.refresh();
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };
  const HandleDearchive = async () => {
    try {
      setLoading(true);
      await axios.patch(`/api/${storeId}/products/${data.id}`, {
        archived: false,
        featured: false,
      });
      toast.success("Product successfully dearchived");
      router.refresh();
    } catch (error) {
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
          <Button variant="ghost" size="icon" disabled={loading}>
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
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
            <CopyIcon className="h-4 w-4 mr-2" />
            Copy ID
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => {
              HandleEdit();
            }}
          >
            <Edit3Icon className="h-4 w-4 mr-2" />
            <h2> Edit</h2>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-500/10"
            onClick={() => {
              setOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Magnet className="h-4 w-4 mr-2" />
              Feature
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="cursor-pointer">
                <DropdownMenuItem
                  onClick={() => {
                    HandleFeature();
                  }}
                >
                  Feature
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    HandleDeFeature();
                  }}
                >
                  De-Feature
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <ArchiveRestore className="h-4 w-4 mr-2" />
              Archive
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="cursor-pointer">
                <DropdownMenuItem
                  onClick={() => {
                    HandleArchive();
                  }}
                >
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    HandleDearchive();
                  }}
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
