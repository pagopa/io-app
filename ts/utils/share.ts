import { tryCatch } from "fp-ts/lib/TaskEither";
import { Platform } from "react-native";
import Share from "react-native-share";

/**
 * share a file encoded in base64
 * @param content base64
 * @param message option string to attach as a text with shared file
 */
export const shareBase64Content = (
  content: string,
  message?: string,
  failOnCancel: boolean = false
) => {
  return tryCatch(
    () =>
      Share.open({
        url: `data:image/png;base64,${content}`,
        message,
        failOnCancel
      }),
    errorMsg => new Error(String(errorMsg))
  );
};

/***
 * Return true if the share is available
 * sharing is disabled on Android versions older than 21 due to a bug causing crash (see https://www.pivotaltracker.com/n/projects/2048617/stories/174295714)
 */
export const isShareEnabled = () =>
  Platform.select({
    android: Platform.Version >= 21,
    ios: true,
    default: false
  });
