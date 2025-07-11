"use client";
import { useEffect } from "react";
import { useStore } from "@/store/useStore";

export default function HydrationProvider() {
  const setHydrated = useStore((state) => state.setHydrated);
  useEffect(() => {
    setHydrated(true);
  }, [setHydrated]);
  return null;
} 