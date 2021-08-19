import { TaskEither, tryCatch } from "fp-ts/lib/TaskEither";
import { useRef, useState } from "react";
import * as React from "react";
import { AppState, AppStateStatus, Platform } from "react-native";
import ScreenBrightness from "react-native-screen-brightness";

const getBrightnessPlatform: () => Promise<number> = () =>
  Platform.select({
    ios: ScreenBrightness.getBrightness,
    default: ScreenBrightness.getAppBrightness
  })();

const setBrightnessPlatform = (brightness: number): Promise<number> =>
  Platform.select({
    ios: ScreenBrightness.setBrightness,
    default: ScreenBrightness.setAppBrightness
  })(brightness);

// if right return the current brightness
export const getBrightness = (): TaskEither<Error, number> =>
  tryCatch(getBrightnessPlatform, reason => new Error(String(reason)));

// if right return the set brightness
export const setBrightness = (brightness: number): TaskEither<Error, number> =>
  tryCatch(
    () => setBrightnessPlatform(brightness),
    reason => new Error(String(reason))
  );

const HIGH_BRIGHTNESS = 1.0; // Max brightness value

/**
 * Set the device brightness to the max value and restore the original brightness when
 * the component is unmount or the app changes state (!== active)
 */
export const useMaxBrightness = () => {
  // The initial device brightness
  const [startBrightness, setStartBrightness] = useState<number | undefined>(
    undefined
  );
  // The current app state
  const [appState, setAppState] = useState<AppStateStatus | undefined>(
    undefined
  );
  // Track the current async transition, in order to wait before execute the next async transition
  const currentTransition = useRef<Promise<void>>(Promise.resolve());

  AppState.addEventListener("change", setAppState);

  // Change the device brightness
  const setNewBrightness = async (brightness: number) => {
    await currentTransition.current;
    await setBrightness(brightness).run();
  };

  // First mount, read and save the current device brightness
  React.useEffect(() => {
    const getCurrentBrightness = async () => {
      setStartBrightness(
        await getBrightness()
          .fold(
            () => undefined,
            _ => _
          )
          .run()
      );
    };
    // eslint-disable-next-line functional/immutable-data
    currentTransition.current = getCurrentBrightness();
  }, []);

  // If app state changes of currentBrightness changes, update the brightness
  React.useEffect(() => {
    if (startBrightness === undefined) {
      return;
    }
    const newBrightness =
      appState === "active" || appState === undefined
        ? HIGH_BRIGHTNESS
        : startBrightness;

    // eslint-disable-next-line functional/immutable-data
    currentTransition.current = setNewBrightness(newBrightness);

    return () => {
      AppState.removeEventListener("change", setAppState);
      if (startBrightness) {
        void setNewBrightness(startBrightness);
      }
    };
  }, [startBrightness, appState]);
};
