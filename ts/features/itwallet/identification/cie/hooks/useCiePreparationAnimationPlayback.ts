import { useCallback, useEffect, useState } from "react";

type UseCiePreparationAnimationPlaybackParams = {
  autoPlay: boolean;
  maxDurationMs: number;
  reduceMotion: boolean;
};

/**
 * Handles playback state for animated CIE preparation media.
 *
 * Responsibilities:
 * - start/stop playback
 * - auto-stop after `maxDurationMs`
 * - stop immediately when reduced-motion is enabled
 * - expose a stable key that can be used to force GIF restart on play
 */
export const useCiePreparationAnimationPlayback = ({
  autoPlay,
  maxDurationMs,
  reduceMotion
}: UseCiePreparationAnimationPlaybackParams) => {
  const [playIteration, setPlayIteration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(() => autoPlay && !reduceMotion);

  // Never play if reduced motion is enabled, even if autoPlay is true.
  useEffect(() => {
    if (reduceMotion) {
      setIsPlaying(false);
    }
  }, [reduceMotion]);

  // Auto-stop playback after a fixed duration.
  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const timeout = setTimeout(() => {
      setIsPlaying(false);
    }, maxDurationMs);

    return () => clearTimeout(timeout);
  }, [isPlaying, maxDurationMs]);

  const togglePlayback = useCallback(() => {
    if (reduceMotion) {
      return;
    }
    setIsPlaying(prev => {
      if (!prev) {
        setPlayIteration(v => v + 1);
        return true;
      }
      return false;
    });
  }, [reduceMotion]);

  // Increasing `playIteration` changes the key and restarts the GIF.
  const imageKey = isPlaying ? `playing-${playIteration}` : "paused";

  return {
    isPlaying,
    imageKey,
    togglePlayback
  };
};
