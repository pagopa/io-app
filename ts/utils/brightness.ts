/* eslint-disable functional/immutable-data */
import { useCallback, useEffect, useRef } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";
import ScreenBrightness from "react-native-screen-brightness";

// The maximum brightness
const HIGH_BRIGHTNESS = 1.0;

// This duration is chosen to be long enough to be noticeable but short enough to not be annoying
const DEFAULT_TRANSITION_DURATION = 1500;

type UseMaxBrightnessOptions = {
  /**
   * Whether to use a smooth transition to the maximum brightness
   */
  useSmoothTransition?: boolean;
  /**
   * The duration of the smooth transition
   */
  transitionDuration?: number;
};

/**
 * Custom hook that manages screen brightness
 * - Sets maximum brightness when mounted and app is active
 * - Restores original brightness when unmounted or app is inactive
 * - Handles platform-specific brightness APIs
 * - Smoothly transitions brightness when `useSmoothTransition` is true
 */
export function useMaxBrightness({
  useSmoothTransition = false,
  transitionDuration = DEFAULT_TRANSITION_DURATION
}: UseMaxBrightnessOptions = {}) {
  const initialBrightness = useRef<number | null>(null);

  const getBrightness = useCallback(
    async () =>
      Platform.select({
        ios: () => ScreenBrightness.getBrightness(),
        default: () => ScreenBrightness.getAppBrightness()
      })(),
    []
  );

  const setBrightness = useCallback(
    async (brightness: number) =>
      Platform.select({
        ios: () => ScreenBrightness.setBrightness(brightness),
        default: () => ScreenBrightness.setAppBrightness(brightness)
      })(),
    []
  );

  const setSmoothBrightness = useCallback(
    async (brightness: number, duration: number) => {
      const startBrightness = await getBrightness();
      const startTime = Date.now();
      const diff = brightness - startBrightness;

      // Animate brightness change over duration
      const animate = async () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Calculate current brightness using linear interpolation
        const currentBrightness = startBrightness + diff * progress;
        await setBrightness(currentBrightness);

        if (progress < 1) {
          // Continue animation
          requestAnimationFrame(animate);
        }
      };

      await animate();
    },
    [getBrightness, setBrightness]
  );

  useEffect(() => {
    // eslint-disable-next-line functional/no-let
    let appStateSubscription: any;

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        await setBrightness(HIGH_BRIGHTNESS);
      } else if (initialBrightness.current !== null) {
        await setBrightness(initialBrightness.current);
      }
    };

    const initialize = async () => {
      try {
        // Store initial brightness
        initialBrightness.current = await getBrightness();
        // Set to max brightness
        await (useSmoothTransition
          ? setSmoothBrightness(HIGH_BRIGHTNESS, transitionDuration)
          : setBrightness(HIGH_BRIGHTNESS));
        // Listen for app state changes
        appStateSubscription = AppState.addEventListener(
          "change",
          handleAppStateChange
        );
      } catch (error) {
        // Ignore
      }
    };

    void initialize();

    return () => {
      if (initialBrightness.current !== null) {
        void setBrightness(initialBrightness.current);
      }
      appStateSubscription?.remove();
    };
  }, [
    useSmoothTransition,
    transitionDuration,
    setSmoothBrightness,
    getBrightness,
    setBrightness
  ]);
}
