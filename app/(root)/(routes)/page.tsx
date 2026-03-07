"use client";
import { useStoreModal } from "@/hooks/use-store-modal";
import React, { useEffect } from "react";
import { Loader } from "@/components/ui/loader";

const SetupPage = () => {
  const onOpen = useStoreModal(state => state.onOpen);
  const isOpen = useStoreModal(state => state.isOpen);

  useEffect(() => {
    if (!isOpen) {
      onOpen();
    }
    // // // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-linear-to-br from-background via-background to-muted/20">
      <div className="flex flex-col items-center space-y-6">
        <div className="relative">
          <div className="absolute -inset-1 rounded-full bg-linear-to-r from-purple-600 to-pink-600 opacity-75 blur-lg animate-pulse"></div>
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-background border-2 border-primary/20">
            <Loader />
          </div>
        </div>

        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-bold bg-linear-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            ForgeCommerce
          </h1>
          <p className="text-muted-foreground text-lg">
            Setting up your store...
          </p>
        </div>

        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <div className="size-2 rounded-full bg-primary animate-pulse"></div>
          <span>Initializing workspace</span>
        </div>
      </div>
    </div>
  );
};

export default SetupPage;
