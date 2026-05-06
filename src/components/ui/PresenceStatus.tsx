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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const discordUserId = process.env.NEXT_PUBLIC_DISCORD_USER_ID;

  const fetchData = useCallback(async () => {
    if (!discordUserId) {
      setError("Discord user ID not configured");
      setIsLoading(false);
      return;
    }

    // Abort previous request if still pending
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
        const parsedSpotify = parseSpotifyData(
          response.presence_data.spotify_status,
        );
        const parsedActivities = parseActivityData(
          response.presence_data.misc_activities,
        );

        setSpotifyData(parsedSpotify);
        setActivities(parsedActivities);
        setError(null);
      } else {
        setError("Failed to fetch presence data");
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        console.warn("Presence API error:", err.message);
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [discordUserId]);

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set up polling every 5 seconds
    intervalRef.current = setInterval(fetchData, 5000);

    return () => {
      // Cleanup
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
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
