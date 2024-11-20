/* eslint-disable functional/immutable-data */
import { useEffect, useRef } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";
import ScreenBrightness from "react-native-screen-brightness";

const HIGH_BRIGHTNESS = 1.0;

/**
 * Custom hook that manages screen brightness
 * - Sets maximum brightness when mounted and app is active
 * - Restores original brightness when unmounted or app is inactive
 * - Handles platform-specific brightness APIs
 */
export function useMaxBrightness() {
  const initialBrightness = useRef<number | null>(null);

  const getBrightness = async () =>
    Platform.select({
      ios: () => ScreenBrightness.getBrightness(),
      default: () => ScreenBrightness.getAppBrightness()
    })();

  const setBrightness = async (brightness: number) =>
    Platform.select({
      ios: () => ScreenBrightness.setBrightness(brightness),
      default: () => ScreenBrightness.setAppBrightness(brightness)
    })();

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
        await setBrightness(HIGH_BRIGHTNESS);
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

    // Cleanup function
    return () => {
      if (initialBrightness.current !== null) {
        void setBrightness(initialBrightness.current);
      }
      appStateSubscription?.remove();
    };
  }, []);
}
