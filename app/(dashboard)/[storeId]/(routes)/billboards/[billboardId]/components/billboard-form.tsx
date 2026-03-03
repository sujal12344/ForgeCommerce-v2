"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Heading from "@/components/ui/heading";
import ImageUpload from "@/components/ui/Image-upload";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { BillBoard } from "@prisma/client";
import axios from "axios";
import { Trash as TrashIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as z from "zod";
import { AlertModal } from "../../../../../../../components/modals-and-nav/Alert-modal";

type BillBoardFormProps = {
  initialdata: BillBoard | null;
};
const formSchema = z.object({
  label: z.string().min(1),
  imageUrl: z.string().min(1, "Background image is required"),
});

const BillBoardForm = ({ initialdata }: BillBoardFormProps) => {
  const title = initialdata ? "Edit Billboard" : "Create billboard";
  const description = initialdata
    ? "Edit the properties of a billboard"
    : "Add a new billboard";
  const buttontag = initialdata ? "Change" : "Create";
  const toastMsg = initialdata ? "Edited the Billboard" : "Added new billboard";

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const params = useParams();
  const rawStoreId = params.storeId;
  const rawBillboardId = params.billboardId;
  const storeId = Array.isArray(rawStoreId) ? rawStoreId[0] : rawStoreId;
  const billboardId = Array.isArray(rawBillboardId)
    ? rawBillboardId[0]
    : rawBillboardId;
  if (!storeId) throw new Error("Store ID is missing from route params");
  if (initialdata && !billboardId)
    throw new Error("Billboard ID is missing from route params");
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialdata || {
      label: "",
      imageUrl: "",
    },
  });
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      if (initialdata) {
        await axios.patch(`/api/${storeId}/billboards/${billboardId}`, values);
      } else {
        await axios.post(`/api/${storeId}/billboards`, values);
      }
      toast.success(toastMsg);
      router.refresh();
      router.push(`/${storeId}/billboards`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const Handledelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${storeId}/billboards/${billboardId}`);
      toast.success("Billboard successfully deleted");
      router.refresh();
      router.push(`/${storeId}/billboards`);
    } catch {
      toast.error(
        "Please delete all the categories before deleting this first"
      );
    } finally {
      setLoading(false);
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
      <div className="flex  items-center justify-between pt-6 px-6">
        <div>
          <Heading title={title} description={description} />
        </div>
        {initialdata && (
          <Button
            variant={"destructive"}
            size={"icon"}
            onClick={() => setOpen(true)}
            disabled={loading}
          >
            <TrashIcon className="h-5 w-4" />
          </Button>
        )}
      </div>
      <div className="pl-6 w-1/3 flex items-start mt-10">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="imageUrl"
              render={(
                { field } //field passes imageUrl array
              ) => (
                <FormItem>
                  <FormLabel className="font-bold text-primary">
                    Add a Background Image
                  </FormLabel>
                  <FormControl>
                    <ImageUpload
                      disabled={loading}
                      onChange={url => {
                        field.onChange(url); //Updates the array with the current url
                      }}
                      onRemove={() => {
                        field.onChange("");
                      }}
                      values={field.value ? [field.value] : []} //If we want multiple images then we can pass here a single value in array is passed
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-primary">
                    Label
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Billboard text.."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className={cn("flex ")}>
              <Button
                className="hover:bg-white hover:text-black hover:border-black border-2 px-3 "
                disabled={loading}
                type="submit"
              >
                {buttontag}
              </Button>
            </div>
          </form>
        </Form>
      </div>
      <Separator className="mx-6 mt-2 " />
    </>
  );
};

export default BillBoardForm;
