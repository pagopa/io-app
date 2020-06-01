import { tryCatch } from "fp-ts/lib/TaskEither";
import Share from "react-native-share";

export const shareBase64Content = (content: string, message?: string) => {
  return tryCatch(
    () =>
      Share.open({
        url: `data:image/png;base64,${content}`,
        message,
        failOnCancel: false
      }),
    errorMsg => new Error(String(errorMsg))
  );
};
