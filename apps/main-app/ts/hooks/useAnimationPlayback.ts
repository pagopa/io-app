import { useCallback, useEffect, useState } from "react";

type UseAnimationPlaybackParams = {
  autoPlay: boolean;
  maxDurationMs: number;
  reduceMotion: boolean;
};

/** Controls timed animation playback while respecting reduced motion. */
export const useAnimationPlayback = ({
  autoPlay,
  maxDurationMs,
  reduceMotion
}: UseAnimationPlaybackParams) => {
  const [playIteration, setPlayIteration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(() => autoPlay && !reduceMotion);

  useEffect(() => {
    if (reduceMotion) {
      setIsPlaying(false);
    }
  }, [reduceMotion]);

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

  const imageKey = isPlaying ? `playing-${playIteration}` : "paused";

  return {
    isPlaying,
    imageKey,
    togglePlayback
  };
};
