import { ImageSourcePropType, Platform } from "react-native";

/**
 * Adds a locale timestamp to the image URI to invalidate cache on the following day if the current platform is Android.
 * Useful to bypass React Native Image component aggressive cache on Android.
 * @param source - the source of the image.
 * @returns a new source with a modified URI which includes the actual timestamp in the locale format without slashes
 * if the platform is Android and the source contains an URI. The same source otherwise.
 */
export const addCacheTimestampToUri = (source: ImageSourcePropType) => {
  // If the platform is not Android, return the source as is
  if (Platform.OS !== "android") {
    return source;
  }

  // If the source is a number, it's a local image return as is
  if (typeof source === "number") {
    return source;
  }

  // This invalidates the cache on the following day
  const cacheBurstParam = new Date()
    .toISOString()
    .split("T")[0]
    .replace(/-/g, "");

  if (Array.isArray(source)) {
    return source.map(image =>
      image.uri
        ? { ...image, uri: `${image.uri}?ts=${cacheBurstParam}` }
        : image
    );
  } else {
    return source.uri
      ? { ...source, uri: `${source.uri}?ts=${cacheBurstParam}` }
      : source;
  }
};
