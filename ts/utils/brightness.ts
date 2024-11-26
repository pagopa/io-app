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

  /**
   * Get the current brightness
   */
  const getBrightness = useCallback(
    async () =>
      Platform.select({
        ios: () => ScreenBrightness.getBrightness(),
        default: () => ScreenBrightness.getAppBrightness()
      })(),
    []
  );

  /**
   * Set the brightness
   */
  const setBrightness = useCallback(
    async (brightness: number) =>
      Platform.select({
        ios: () => ScreenBrightness.setBrightness(brightness),
        default: () => ScreenBrightness.setAppBrightness(brightness)
      })(),
    []
  );

  /**
   * Set the brightness with a smooth transition
   */
  const setSmoothBrightness = useCallback(
    async (brightness: number, duration: number) => {
      // Ensure minimum starting brightness of 0.4 to prevent unintended dimming
      // Some android devices report negative values, which could cause jarring transitions
      const startBrightness = Math.max(0.4, await getBrightness());
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

  /**
   * Set the brightness to the maximum, uses a smooth transition if `useSmoothTransition` is true
   */
  const setMaxBrightness = useCallback(
    async () =>
      await (useSmoothTransition
        ? setSmoothBrightness(HIGH_BRIGHTNESS, transitionDuration)
        : setBrightness(HIGH_BRIGHTNESS)),
    [
      setSmoothBrightness,
      setBrightness,
      useSmoothTransition,
      transitionDuration
    ]
  );

  /**
   * Restore the original brightness with a smooth transition.
   * Using a smooth transition may cause glitches, so we don't use it here.
   */
  const restoreOriginalBrightness = useCallback(async () => {
    if (initialBrightness.current !== null) {
      void setBrightness(initialBrightness.current);
    }
  }, [setBrightness]);

  /**
   * Set the brightness when the app is active and restore the original brightness when the app is inactive
   */
  useEffect(() => {
    // eslint-disable-next-line functional/no-let
    let appStateSubscription: any;

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        await setMaxBrightness();
      } else if (initialBrightness.current !== null) {
        await restoreOriginalBrightness();
      }
    };

    const initialize = async () => {
      try {
        // Store initial brightness
        initialBrightness.current = await getBrightness();
        // Set to max brightness
        await setMaxBrightness();
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
      void restoreOriginalBrightness();
      appStateSubscription?.remove();
    };
  }, [getBrightness, restoreOriginalBrightness, setMaxBrightness]);
}
