"use client";

import { Modal } from "@/components/modals-and-nav/modal";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

type AlertModalProps = {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  onConfirm: () => void;
};

export const AlertModal = ({
  isOpen,
  onClose,
  loading,
  onConfirm,
}: AlertModalProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true); // Until this lifecycle has run, there shouldn't be any difference between server and client side components, hence we return null
  }, []);

  if (!isMounted) {
    return null; //this is used to not cause hydration as the provider is a client component
  }

  return (
    <Modal
      title="Are you sure?"
      description="This action cannot be undone. This will permanently delete the selected data."
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="pt-4 flex items-center justify-end gap-3 w-full">
        <Button
          disabled={loading}
          onClick={onClose}
          variant="outline"
          className="min-w-20"
        >
          Cancel
        </Button>
        <Button
          disabled={loading}
          onClick={onConfirm}
          variant="destructive"
          className="min-w-20"
        >
          {loading ? "Deleting..." : "Delete"}
        </Button>
      </div>
    </Modal>
  );
};
