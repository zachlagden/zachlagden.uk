"use client";

import { useEffect, useCallback, useRef } from "react";

export default function useAutoSave<T>(
  key: string,
  data: T,
  delay: number = 5000,
) {
  const timerRef = useRef<NodeJS.Timeout>(undefined);

  const save = useCallback(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(`autosave-${key}`, JSON.stringify(data));
  }, [key, data]);

  const load = useCallback((): T | null => {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem(`autosave-${key}`);
    if (!saved) return null;
    try {
      return JSON.parse(saved) as T;
    } catch {
      return null;
    }
  }, [key]);

  const clear = useCallback(() => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(`autosave-${key}`);
  }, [key]);

  useEffect(() => {
    timerRef.current = setInterval(save, delay);
    return () => clearInterval(timerRef.current);
  }, [save, delay]);

  return { save, load, clear };
}
