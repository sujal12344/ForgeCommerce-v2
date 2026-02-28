"use client";

import { Loader } from "@/components/ui/loader";

export const Loading = () => {
  return (
    <div className="flex space-x-2 h-full w-full items-center justify-center">
      <Loader />
      <p className="animate-pulse text-gray-600 text-lg">
        Preparing awesomeness...
      </p>
    </div>
  );
};
