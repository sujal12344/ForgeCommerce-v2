"use client";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getSnapshot = () =>
  typeof window !== "undefined" ? window.location.origin : "";
const getServerSnapshot = () => "";

const useOrigin = () => {
  const origin = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
  return origin;
};

export default useOrigin;
