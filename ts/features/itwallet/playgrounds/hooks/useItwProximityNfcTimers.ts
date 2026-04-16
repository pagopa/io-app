/* eslint-disable functional/immutable-data */
import { useCallback, useRef, useState } from "react";
import { Platform } from "react-native";

const SESSION_DURATION_S = 15;
const COOLDOWN_DURATION_S = 15;

export const useItwProximityNfcTimers = () => {
  const [nfcSessionSecondsLeft, setNfcSessionSecondsLeft] = useState<
    number | null
  >(null);
  const [nfcCooldownSecondsLeft, setNfcCooldownSecondsLeft] = useState<
    number | null
  >(null);

  const sessionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const cooldownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  const startSessionTimer = useCallback(() => {
    if (Platform.OS !== "ios") {
      return;
    }

    if (sessionIntervalRef.current) {
      clearInterval(sessionIntervalRef.current);
    }

    setNfcSessionSecondsLeft(SESSION_DURATION_S);
    sessionIntervalRef.current = setInterval(() => {
      setNfcSessionSecondsLeft(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(sessionIntervalRef.current!);
          sessionIntervalRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const clearSessionTimer = useCallback(() => {
    if (Platform.OS !== "ios") {
      return;
    }

    if (sessionIntervalRef.current) {
      clearInterval(sessionIntervalRef.current);
    }
    sessionIntervalRef.current = null;
    setNfcSessionSecondsLeft(null);
  }, []);

  const startCooldownTimer = useCallback(() => {
    if (Platform.OS !== "ios") {
      return;
    }

    if (cooldownIntervalRef.current) {
      clearInterval(cooldownIntervalRef.current);
    }
    setNfcCooldownSecondsLeft(COOLDOWN_DURATION_S);
    cooldownIntervalRef.current = setInterval(() => {
      setNfcCooldownSecondsLeft(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(cooldownIntervalRef.current!);
          cooldownIntervalRef.current = null;
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  return {
    nfcSessionSecondsLeft,
    nfcCooldownSecondsLeft,
    startSessionTimer,
    clearSessionTimer,
    startCooldownTimer
  };
};
