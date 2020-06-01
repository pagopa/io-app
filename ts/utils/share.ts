import { tryCatch } from "fp-ts/lib/TaskEither";
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
