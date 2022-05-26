import * as React from "react";
import { useRef, useState } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";
import ScreenBrightness from "react-native-screen-brightness";

const getBrightness = (): Promise<number> =>
  Platform.select({
    ios: ScreenBrightness.getBrightness,
    default: ScreenBrightness.getAppBrightness
  })();

const setBrightness = (brightness: number): Promise<number> =>
  Platform.select({
    ios: ScreenBrightness.setBrightness,
    default: ScreenBrightness.setAppBrightness
  })(brightness);

const HIGH_BRIGHTNESS = 1.0; // Max brightness value

/**
 * Set the device brightness to the max value and restore the original brightness when
 * the component is unmount or the app changes state (!== active)
 */
export const useMaxBrightness = () => {
  const [initialBrightness, setInitialBrightness] = useState<
    number | undefined
  >(undefined);
  // The current app state
  const [appState, setAppState] = useState<AppStateStatus | undefined>(
    undefined
  );
  // Track the current async transition, in order to wait before execute the next async transition
  const currentTransition = useRef<Promise<void>>(Promise.resolve());

  // Change the device brightness
  const setNewBrightness = async (brightness: number) => {
    await currentTransition.current;
    await setBrightness(brightness).catch(_ => undefined);
  };

  // First mount, read and save the current device brightness
  React.useEffect(() => {
    const subscription = AppState.addEventListener("change", setAppState);
    const getCurrentBrightness = async () => {
      const currentBrightness = await getBrightness().catch(_ => undefined);
      setInitialBrightness(currentBrightness);
    };
    // eslint-disable-next-line functional/immutable-data
    currentTransition.current = getCurrentBrightness();
    return () => {
      subscription.remove();
    };
  }, []);

  // If app state changes of currentBrightness changes, update the brightness
  React.useEffect(() => {
    if (initialBrightness === undefined) {
      return;
    }
    const newBrightness =
      appState === "active" || appState === undefined
        ? HIGH_BRIGHTNESS
        : initialBrightness;

    // eslint-disable-next-line functional/immutable-data
    currentTransition.current = setNewBrightness(newBrightness);

    // unmount and reset the initial brightness
    return () => {
      if (initialBrightness) {
        void setNewBrightness(initialBrightness);
      }
    };
  }, [initialBrightness, appState]);
};
