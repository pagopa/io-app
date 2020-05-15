import { Either } from "fp-ts/lib/Either";
import { Task } from "fp-ts/lib/Task";
import { tryCatch } from "fp-ts/lib/TaskEither";
import { Platform } from "react-native";
import ScreenBrightness from "react-native-screen-brightness";

export const getBrightness = (): Promise<Either<Error, number>> => {
  const getBrightnessTask = new Task(
    () =>
      Platform.OS === "ios"
        ? ScreenBrightness.getBrightness()
        : ScreenBrightness.getAppBrightness()
  );
  return tryCatch(
    () =>
      getBrightnessTask
        .chain(brightness => {
          return new Task(() => Promise.resolve(brightness));
        })
        .run(),
    reason => new Error(String(reason))
  )
    .map(brightness => brightness)
    .run();
};

export const setBrightness = (val: number): void => {
  if (Platform.OS === "ios") {
    // tslint:disable-next-line: no-floating-promises
    ScreenBrightness.setBrightness(val);
  } else {
    // tslint:disable-next-line: no-floating-promises
    ScreenBrightness.setAppBrightness(val);
  }
};
