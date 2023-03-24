import { pipe } from "fp-ts/lib/function";
import { ImageURISource, Platform } from "react-native";
import * as B from "fp-ts/boolean";
import * as T from "io-ts";
import * as E from "fp-ts/Either";
import { toAndroidCacheTimestamp } from "./dates";

export const withBase64Uri = (
  imageBase64: string,
  format: "png" | "jpg" = "png"
) => `data:image/${format};base64,${imageBase64}`;

/**
 * Adds a locale timestamp to the image URI to invalidate cache on the following day if the current platform is Android.
 * Useful to bypass React Native Image component aggressive cache on Android.
 * @param source - the source of the image.
 * @returns a new source with a modified URI which includes the actual timestamp in the locale format without slashes
 * if the platform is Android and the source contains an URI. The same source otherwise.
 */
export const addCacheTimestampToUri = (source: ImageURISource) => {
  const UriSource = T.type({
    uri: T.string
  });

  return pipe(
    Platform.OS === "android",
    B.fold(
      () => source,
      () =>
        pipe(
          source,
          UriSource.decode,
          E.fold(
            () => source,
            () => ({
              ...source,
              uri: `${source.uri}?ts=${toAndroidCacheTimestamp()}`
            })
          )
        )
    )
  );
};
