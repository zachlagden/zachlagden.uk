"use client";

import { useEffect, useCallback, useRef, useState } from "react";

export interface UseAutoSaveResult<T> {
  save: () => void;
  load: () => T | null;
  clear: () => void;
  error: string | null;
}

export default function useAutoSave<T>(
  key: string,
  data: T,
  delay: number = 5000,
): UseAutoSaveResult<T> {
  const timerRef = useRef<NodeJS.Timeout>(undefined);
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(`autosave-${key}`, JSON.stringify(data));
      setError((prev) => (prev === null ? prev : null));
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === "QuotaExceededError"
          ? "Autosave failed: localStorage quota exceeded. Recent changes may be lost if you navigate away."
          : "Autosave failed.";
      console.warn(`[useAutoSave:${key}]`, message, err);
      setError(message);
    }
  }, [key, data]);

  const load = useCallback((): T | null => {
    if (typeof window === "undefined") return null;
    try {
      const saved = localStorage.getItem(`autosave-${key}`);
      if (!saved) return null;
      return JSON.parse(saved) as T;
    } catch {
      return null;
    }
  }, [key]);

  const clear = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(`autosave-${key}`);
    } catch {
      // ignore — clear failures are inert
    }
  }, [key]);

  useEffect(() => {
    timerRef.current = setInterval(save, delay);
    return () => clearInterval(timerRef.current);
  }, [save, delay]);

  return { save, load, clear, error };
}
