"use client";
import { AlertModal } from "@/components/modals-and-nav/Alert-modal";
import ApiBlock from "@/components/ui/api-block";
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
import UseOrigin from "@/hooks/origin-client";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Trash as TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as z from "zod";

type SettingsProps = {
  name: string;
  id: string;
};
const formSchema = z.object({
  updatedname: z.string().min(1),
});
const SettingsPage = ({ name, id }: SettingsProps) => {
  const [loading, setloading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const origin = UseOrigin();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      updatedname: name,
    },
  });
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setloading(true);
      if (values.updatedname === name) {
        throw new Error("Same as previous name");
      }
      const Updatename = await axios.patch(`/api/store/${id}`, values);
      if (Updatename.status === 200) {
        toast.success("Name changed successfully");
        router.refresh();
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update store name";
      toast.error(message);
    } finally {
      setloading(false);
    }
  };

  const HandleDelete = async () => {
    try {
      setloading(true);
      await axios.delete(`/api/store/${id}`);
      toast.success("Store successfully deleted");
      router.push("/");
    } catch {
      toast.error("Please delete all the products first");
    } finally {
      setloading(false);
    }
  };
  return (
    <div className="space-y-6">
      <AlertModal
        isOpen={open}
        loading={loading}
        onClose={() => setOpen(false)}
        onConfirm={HandleDelete}
      />
      <div className="flex items-center justify-between">
        <Heading
          title="Settings"
          description="Manage store preferences and danger zone"
        />
      </div>
      <Separator />
      <div className="grid md:grid-cols-3 gap-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="updatedname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Your updated name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              className="bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white hover:scale-105 transition-all duration-200 shadow-sm"
              disabled={loading}
              type="submit"
            >
              Save Changes
            </Button>
          </form>
        </Form>
      </div>
      <Separator />
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          API Reference
        </span>
        <div className="flex-1 h-px bg-border/50" />
      </div>
      <ApiBlock
        title="NEXT_PUBLIC_API_URL"
        description={`${origin}/api/${id}`}
        variant="public"
        type="env"
      />
      <Separator />
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-red-500/70">
          Danger Zone
        </span>
        <div className="flex-1 h-px bg-red-500/20" />
      </div>
      <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">
            Delete this store
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Permanently delete this store and all of its data. This action
            cannot be undone.
          </p>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setOpen(true)}
          disabled={loading}
          className="shrink-0 ml-4"
        >
          <TrashIcon className="h-4 w-4 mr-2" />
          Delete Store
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;
