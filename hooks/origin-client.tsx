"use client";
import { useSyncExternalStore } from "react";

const useOrigin = () => {
  const origin = useSyncExternalStore(
    () => () => {},
    () => (typeof window !== "undefined" && window.location.origin) ? window.location.origin : "",
    () => ""
  );
  return origin;
};

export default useOrigin;
