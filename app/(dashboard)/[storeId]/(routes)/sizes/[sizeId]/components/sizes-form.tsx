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
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { Size } from "@prisma/client";
import axios from "axios";
import { TrashIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as z from "zod";
import { AlertModal } from "../../../../../../../components/modals-and-nav/Alert-modal";

type SizesFormProps = {
  initialData: Size | null;
};
const formSchema = z.object({
  name: z.string().min(1),
  value: z.string().min(1),
});

const SizeForm = ({ initialData }: SizesFormProps) => {
  const title = initialData ? "Edit Size" : "Create size";
  const description = initialData
    ? "Edit the properties of a size"
    : "Add a new size";
  const buttontag = initialData ? "Change" : "Create";
  const toastMsg = initialData ? "Edited the Size" : "Added new size";

  const [loading, setloading] = useState(false);
  const [open, setOpen] = useState(false);
  const params = useParams();
  const rawStoreId = params.storeId;
  const rawSizeId = params.sizeId;
  const storeId = Array.isArray(rawStoreId) ? rawStoreId[0] : rawStoreId;
  const sizeId = Array.isArray(rawSizeId) ? rawSizeId[0] : rawSizeId;
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      value: "",
    },
  });
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!storeId) {
      toast.error("Store ID is missing");
      return;
    }
    if (initialData && !sizeId) {
      toast.error("Size ID is missing");
      return;
    }
    try {
      setloading(true);
      if (initialData) {
        await axios.patch(`/api/${storeId}/sizes/${sizeId}`, values);
      } else {
        await axios.post(`/api/${storeId}/sizes`, values);
      }
      toast.success(toastMsg);
      router.refresh();
      router.push(`/${storeId}/sizes`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setloading(false);
    }
  };

  const Handledelete = async () => {
    if (!storeId || !sizeId) {
      toast.error("Missing route params");
      return;
    }
    try {
      setloading(true);
      await axios.delete(`/api/${storeId}/sizes/${sizeId}`);
      toast.success("Size successfully deleted");
      router.refresh();
      router.push(`/${storeId}/sizes`);
    } catch {
      toast.error(
        "Please delete all products using this size before deleting it"
      );
    } finally {
      setloading(false);
    }
  };
  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={Handledelete}
        loading={loading}
      />
      <div className="flex items-center justify-between gap-2">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
            size="icon"
            onClick={() => setOpen(true)}
          >
            <TrashIcon className="size-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <div className="md:grid md:grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Size name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Size value"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button
            disabled={loading}
            className="bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white hover:scale-105 transition-all duration-200 shadow-sm"
            type="submit"
          >
            {buttontag}
          </Button>
        </form>
      </Form>
    </>
  );
};

export default SizeForm;
