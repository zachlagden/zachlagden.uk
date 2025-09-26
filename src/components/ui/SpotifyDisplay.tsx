"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ParsedSpotifyData } from "@/types/presence";
import { formatDuration } from "@/utils/presenceService";

interface SpotifyDisplayProps {
  data: ParsedSpotifyData;
  prefersReducedMotion?: boolean;
}

const SpotifyDisplay: React.FC<SpotifyDisplayProps> = ({
  data,
  prefersReducedMotion = false,
}) => {
  const [currentTime, setCurrentTime] = useState(
    new Date().getTime() - data.startTime.getTime(),
  );

  useEffect(() => {
    if (!data.isPlaying) return;

    // Update timer every second for smooth progression
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const elapsed = now - data.startTime.getTime();
      const total = data.endTime.getTime() - data.startTime.getTime();

      // Only update if still within track duration
      if (elapsed <= total) {
        setCurrentTime(elapsed);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [data.startTime, data.endTime, data.isPlaying]);

  // Update currentTime when data changes (new track or API update)
  useEffect(() => {
    setCurrentTime(new Date().getTime() - data.startTime.getTime());
  }, [data.startTime]);

  if (!data.isPlaying) return null;

  const totalTime = data.endTime.getTime() - data.startTime.getTime();

  return (
    <motion.div
      className="text-sm text-neutral-500 font-light"
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -5 }}
      transition={{ duration: prefersReducedMotion ? 0.1 : 0.3 }}
    >
      <div className="flex items-center gap-2">
        <span className="text-green-600">♪</span>
        <a
          href={data.trackUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-neutral-700 transition-colors"
          aria-label={`Listen to ${data.trackName} on Spotify`}
        >
          {data.trackName}
        </a>
        <span> – </span>
        <a
          href={`https://open.spotify.com/search/${encodeURIComponent(data.artists[0])}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-neutral-700 transition-colors"
          aria-label={`View ${data.artists.join(", ")} on Spotify`}
        >
          {data.artists.join(", ")}
        </a>
        <span className="text-neutral-400 tabular-nums text-xs">
          {formatDuration(Math.max(0, currentTime))}/{formatDuration(totalTime)}
        </span>
      </div>
    </motion.div>
  );
};

export default SpotifyDisplay;
