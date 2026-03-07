"use client";

import { Modal } from "@/components/modals-and-nav/modal";
import { Button } from "@/components/ui/button";
import { useSyncExternalStore } from "react";

type AlertModalProps = {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  onConfirm: () => void;
  description?: string;
  confirmLabel?: string;
  loadingLabel?: string;
  confirmVariant?:
    | "destructive"
    | "default"
    | "outline"
    | "secondary"
    | "ghost";
};

export const AlertModal = ({
  isOpen,
  onClose,
  loading,
  onConfirm,
  description = "This action cannot be undone. This will permanently delete the selected data.",
  confirmLabel = "Delete",
  loadingLabel = "Deleting...",
  confirmVariant = "destructive",
}: AlertModalProps) => {
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!isMounted) {
    return null; //this is used to not cause hydration as the provider is a client component
  }

  return (
    <Modal
      title="Are you sure?"
      description={description}
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="pt-3 sm:pt-4 flex items-center justify-end gap-2 sm:gap-3 w-full">
        <Button
          disabled={loading}
          onClick={onClose}
          variant="outline"
          className="min-w-16 sm:min-w-20 h-8 sm:h-9 text-xs sm:text-sm"
        >
          Cancel
        </Button>
        <Button
          disabled={loading}
          onClick={onConfirm}
          variant={confirmVariant}
          className="min-w-16 sm:min-w-20 h-8 sm:h-9 text-xs sm:text-sm"
        >
          {loading ? loadingLabel : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
};
