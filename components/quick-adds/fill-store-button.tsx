"use client";

import { AlertModal } from "@/components/modals-and-nav/Alert-modal";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Database } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

type FillStoreButtonProps = {
  storeId: string;
};

const FillStoreButton = ({ storeId }: FillStoreButtonProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onConfirm = async () => {
    try {
      setLoading(true);
      await axios.post("/api/seed", { storeId });
      toast.success("Demo data seeded successfully!");
      router.refresh();
    } catch (error) {
      console.error("Seed failed:", error);
      toast.error("Failed to seed demo data. Try again.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />
      <Button
        onClick={() => setOpen(true)}
        disabled={loading}
        className="bg-linear-to-r transition-all duration-300 from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 hover:scale-105 hover:shadow-lg text-white flex items-center gap-2"
      >
        <Database className="h-4 w-4" />
        <span className="hidden sm:inline">Fill</span> Store
      </Button>
    </>
  );
};

export default FillStoreButton;
