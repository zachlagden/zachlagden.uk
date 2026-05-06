"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SpotifyDisplay from "./SpotifyDisplay";
import VSCodeDisplay from "./VSCodeDisplay";
import {
  fetchPresenceData,
  parseSpotifyData,
  parseActivityData,
} from "@/utils/presenceService";
import { ParsedSpotifyData, ParsedActivityData } from "@/types/presence";

interface PresenceStatusProps {
  prefersReducedMotion?: boolean;
}

const BASE_INTERVAL_MS = 30_000;
const BACKOFF_STEPS_MS = [5_000, 10_000, 30_000, 60_000, 300_000];

const PresenceStatus: React.FC<PresenceStatusProps> = ({
  prefersReducedMotion = false,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [spotifyData, setSpotifyData] = useState<ParsedSpotifyData | null>(
    null,
  );
  const [activities, setActivities] = useState<ParsedActivityData[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const consecutiveErrorsRef = useRef(0);

  const discordUserId = process.env.NEXT_PUBLIC_DISCORD_USER_ID;

  const fetchData = useCallback(async (): Promise<boolean> => {
    if (!discordUserId) {
      setError("Discord user ID not configured");
      setIsLoading(false);
      return false;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetchPresenceData(
        discordUserId,
        abortControllerRef.current.signal,
      );

      if (response.ok && response.presence_data) {
        setSpotifyData(parseSpotifyData(response.presence_data.spotify_status));
        setActivities(
          parseActivityData(response.presence_data.misc_activities),
        );
        setError(null);
        return true;
      }
      setError("Failed to fetch presence data");
      return false;
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        console.warn("Presence API error:", err.message);
        setError(err.message);
        return false;
      }
      // AbortError — caller is replacing this fetch; don't count as failure
      return true;
    } finally {
      setIsLoading(false);
    }
  }, [discordUserId]);

  useEffect(() => {
    if (!discordUserId) return;
    if (typeof document === "undefined") return;

    let cancelled = false;

    const schedule = (delayMs: number) => {
      if (cancelled) return;
      timeoutRef.current = setTimeout(tick, delayMs);
    };

    const tick = async () => {
      if (cancelled) return;
      if (document.hidden) {
        // Pause polling while tab is hidden — visibilitychange will resume
        return;
      }
      const ok = await fetchData();
      if (cancelled) return;

      if (ok) {
        consecutiveErrorsRef.current = 0;
        schedule(BASE_INTERVAL_MS);
      } else {
        const idx = Math.min(
          consecutiveErrorsRef.current,
          BACKOFF_STEPS_MS.length - 1,
        );
        consecutiveErrorsRef.current += 1;
        schedule(BACKOFF_STEPS_MS[idx]);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      } else {
        // Tab became visible — fetch immediately and resume schedule
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        void tick();
      }
    };

    // Initial fetch
    void tick();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [discordUserId, fetchData]);

  // Don't render anything if no Discord user ID is configured
  if (!discordUserId) {
    return null;
  }

  // Don't render if there's an error or still loading
  if (error || isLoading) {
    return null;
  }

  // Find VS Code activity
  const vscodeActivity = activities.find((a) => a.type === "vscode");
  const hasSpotify = spotifyData?.isPlaying;
  const hasVSCode = !!vscodeActivity;

  // Don't render if no activity to show
  if (!hasSpotify && !hasVSCode) {
    return null;
  }

  return (
    <motion.div
      className="mt-6 flex justify-center"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: prefersReducedMotion ? 0.1 : 0.3 }}
    >
      <div className="flex flex-col items-center gap-2">
        <AnimatePresence>
          {hasSpotify && (
            <SpotifyDisplay
              key="spotify"
              data={spotifyData!}
              prefersReducedMotion={prefersReducedMotion}
            />
          )}
          {hasVSCode && (
            <VSCodeDisplay
              key="vscode"
              data={vscodeActivity!}
              prefersReducedMotion={prefersReducedMotion}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default PresenceStatus;
