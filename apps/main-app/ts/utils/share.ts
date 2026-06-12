import * as TE from "fp-ts/lib/TaskEither";
import Share from "react-native-share";

/**
 * Share an url see
 * https://react-native-share.github.io/react-native-share/docs/share-open#supported-options
 *
 * @param url
 * @param message Option string to attach as a text with shared file
 */
export const share = (
  url: string,
  message?: string,
  failOnCancel: boolean = false
) =>
  TE.tryCatch(
    () =>
      Share.open({
        url,
        message,
        failOnCancel
      }),
    errorMsg => new Error(String(errorMsg))
  );
