import { TaskEither, tryCatch } from "fp-ts/lib/TaskEither";
import { Platform } from "react-native";
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
export const getBrightness = (): TaskEither<Error, number> => {
  return tryCatch(getBrightnessPlatform, reason => new Error(String(reason)));
};

// if right return the set brightness
export const setBrightness = (
  brightness: number
): TaskEither<Error, number> => {
  return tryCatch(
    () => setBrightnessPlatform(brightness),
    reason => new Error(String(reason))
  );
};
