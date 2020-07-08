import { tryCatch } from "fp-ts/lib/TaskEither";
import { AccessibilityInfo } from "react-native";

export const isScreenReaderEnabled = () =>
  tryCatch(
    () => AccessibilityInfo.isScreenReaderEnabled(),
    errorMsg => new Error(String(errorMsg))
  );
