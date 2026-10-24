import { useEffect, useState } from "react";
import { AppState } from "react-native";
import {
  SensorConfig,
  SensorType,
  SharedValue,
  useAnimatedReaction,
  useAnimatedSensor,
  useReducedMotion,
  useSharedValue
} from "react-native-reanimated";

import { useIsScreenFocused } from "./useIsScreenFocused";

/**
 * Every rotation sensor user must pass this config: Reanimated shares one
 * native sensor per type, and the first registration fixes its interval for the
 * whole JS session. Android drops events that arrive even slightly early, so 30
 * ms gives ~30 Hz without uneven gaps.
 */
export const ROTATION_SENSOR_CONFIG: Partial<SensorConfig> = {
  interval: 30
};

/**
 * Roll changes (radians) below this threshold are treated as sensor noise, so a
 * still device does not trigger redraws.
 */
const ROLL_DEAD_ZONE = 0.002;

/**
 * Returns the device roll relative to the first sensor reading, since devices
 * are not always lying flat when the effect starts.
 */
export const useRotationSensor = (): SharedValue<number> => {
  const { sensor } = useAnimatedSensor(
    SensorType.ROTATION,
    ROTATION_SENSOR_CONFIG
  );
  const initialRoll = useSharedValue(0);
  const relativeRoll = useSharedValue(0);

  useAnimatedReaction(
    () => sensor.value.roll,
    roll => {
      // The sensor reports 0 until its first reading
      if (initialRoll.value === 0) {
        initialRoll.value = roll;
      }
      const nextRoll = initialRoll.value - roll;
      if (Math.abs(nextRoll - relativeRoll.value) >= ROLL_DEAD_ZONE) {
        relativeRoll.value = nextRoll;
      }
    },
    []
  );

  return relativeRoll;
};

/**
 * Whether sensor-driven effects should run: the screen is focused, the app is
 * in the foreground and reduce motion is off.
 */
export const useRotationEffectEnabled = (): boolean => {
  const isFocused = useIsScreenFocused();
  const reduceMotion = useReducedMotion();
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", setAppState);
    return () => subscription.remove();
  }, []);

  return isFocused && appState !== "background" && !reduceMotion;
};
