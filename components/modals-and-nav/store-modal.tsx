"use client";
import { useStoreModal } from "@/hooks/use-store-modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import * as z from "zod";
import { Modal } from "./modal";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useState } from "react";

const formSchema = z.object({
  name: z.string().min(1),
});
export const StoreModal = () => {
  const [loading, setloading] = useState(false);
  const storeModal = useStoreModal();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setloading(true);
      const datapush = await axios.post("/api/store", values);
      if (datapush?.data?.id) {
        window.location.assign(`/${datapush.data.id}`);
      } else {
        toast.error("Invalid response from server");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setloading(false);
    }
  };
  return (
    <Modal
      title="Create Store"
      description="Add a new store to manage products and categories"
      isOpen={storeModal.isOpen}
      onClose={storeModal.onClose}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-1">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Store name
                </FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    placeholder="My Fashion Store"
                    className="h-10"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex items-center justify-end gap-3 pt-1">
            <Button
              disabled={loading}
              variant="outline"
              onClick={storeModal.onClose}
              type="button"
              className="min-w-20"
            >
              Cancel
            </Button>
            <Button
              disabled={loading}
              type="submit"
              className="min-w-20 bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white transition-all duration-200"
            >
              {loading ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </Form>
    </Modal>
  );
};
