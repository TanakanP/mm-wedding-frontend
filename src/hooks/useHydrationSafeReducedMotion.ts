"use client";

import { useReducedMotion } from "framer-motion";
import { useSyncExternalStore } from "react";
import { resolveReducedMotion } from "@/lib/reducedMotion";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function useHydrationSafeReducedMotion() {
  const prefersReduced = useReducedMotion();
  const mounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  return resolveReducedMotion(mounted, prefersReduced);
}
