import { tryCatch } from "fp-ts/lib/TaskEither";
import { Platform } from "react-native";
import Share from "react-native-share";

/**
 * share an url see https://react-native-share.github.io/react-native-share/docs/share-open#supported-options
 * @param url
 * @param message option string to attach as a text with shared file
 */
export const share = (
  url: string,
  message?: string,
  failOnCancel: boolean = false
) =>
  tryCatch(
    () =>
      Share.open({
        url,
        message,
        failOnCancel
      }),
    errorMsg => new Error(String(errorMsg))
  );

/**
 * Return true if the share is available
 * sharing is disabled on Android versions older than 21 due to a bug causing crash (see https://www.pivotaltracker.com/n/projects/2048617/stories/174295714)
 */
export const isShareEnabled = () =>
  Platform.select({
    android: Platform.Version >= 21,
    ios: true,
    default: false
  });
