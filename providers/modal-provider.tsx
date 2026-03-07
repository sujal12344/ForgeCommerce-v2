"use client";

import { StoreModal } from "@/components/modals-and-nav/store-modal";
import { useSyncExternalStore } from "react";

export const ModalProvider = () => {
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!isMounted) {
    return null; //this is used to not cause hydration as the provider is a client component
  }

  return <StoreModal />;
};
