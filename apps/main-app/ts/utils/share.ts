import * as Sharing from "expo-sharing";
import * as TE from "fp-ts/lib/TaskEither";

/**
 * share a local file url
 * @param url local file:// URI
 * @param message optional dialog title
 */
export const share = (url: string, message?: string, _failOnCancel = false) =>
  TE.tryCatch(
    () =>
      Sharing.shareAsync(url, message ? { dialogTitle: message } : undefined),
    errorMsg => new Error(String(errorMsg))
  );
