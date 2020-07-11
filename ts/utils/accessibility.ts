import { tryCatch } from "fp-ts/lib/TaskEither";
import { AccessibilityInfo } from "react-native";

export const isScreenReaderEnabled = async (): Promise<boolean> => {
  const maybeReaderEnabled = await tryCatch(
    () => AccessibilityInfo.isScreenReaderEnabled(),
    errorMsg => new Error(String(errorMsg))
  ).run();
  return maybeReaderEnabled.getOrElse(false);
};
