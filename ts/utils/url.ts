import { constNull, pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { Linking } from "react-native";
import { clipboardSetStringWithFeedback } from "./clipboard";
import { openMaps } from "./openMaps";
import { splitAndTakeFirst } from "./strings";
/**
 * Generic utilities for url parsing
 */

/**
 * Return the base name of a remote resource from a give path
 * @param resourceUrl the remote resource url
 * @param includeExt if true include the extension part of the resource
 */
export function getResourceNameFromUrl(
  resourceUrl: string,
  includeExt: boolean = false
): string {
  const splitted = resourceUrl.split("/");
  const resourceName = splitted[splitted.length - 1].toLowerCase();
  return includeExt ? resourceName : resourceName.split(".")[0];
}

/**
 * from a given url return the base path excluding query string and fragments
 * @param url
 */
export const getUrlBasepath = (url: string): string => {
  const sharpIndex = url.indexOf("#");
  const qmIndex = url.indexOf("?");
  const ampIndex = url.indexOf("&");
  const comesBeforeQm = qmIndex === -1 || ampIndex < qmIndex;
  const comesBeforeSharp = sharpIndex === -1 || ampIndex < sharpIndex;
  // if '&' (sub-delimiter) comes before '?' or '#' (query string and fragment) return the url as it is
  if (ampIndex !== -1 && comesBeforeQm && comesBeforeSharp) {
    return url;
  }
  return pipe<string, string, string>(
    u => splitAndTakeFirst(u, "?"),
    u => splitAndTakeFirst(u, "#")
  )(url);
};

export type ItemAction = "MAP" | "COPY" | "LINK";
/**
 * Return the function to:
 * - copy the value, if valueType is COPY
 * - navigate to the map, if valueType is MAP
 * - navigate to a browser, if valueType is LINK
 */
export function handleItemOnPress(
  value: string,
  valueType?: ItemAction
): () => void {
  switch (valueType) {
    case "MAP":
      return () => openMaps(value);
    case "COPY":
      return () => clipboardSetStringWithFeedback(value);
    default:
      return () => Linking.openURL(value).then(constNull).catch(constNull);
  }
}

const isHttp = (url: string): boolean => {
  const urlLower = url.trim().toLocaleLowerCase();
  return urlLower.match(/http(s)?:\/\//gm) !== null;
};

const taskLinking = (url: string) =>
  TE.tryCatch(
    () => Linking.openURL(url),
    _ => `cannot open url ${url}`
  );

const taskCanOpenUrl = (url: string) =>
  TE.tryCatch(
    () => (!isHttp(url) ? Promise.resolve(false) : Linking.canOpenURL(url)),
    _ => `cannot check if can open url ${url}`
  );

/**
 * open the web url if it can ben opened and if it has a valid protocol (http/https)
 * it should be used in place of direct call of Linking.openURL(url) with web urls
 */
export const openWebUrl = (url: string, onError: () => void = constNull) => {
  pipe(
    () => taskCanOpenUrl(url),
    te => te.chain(v => (v ? taskLinking(url) : TE.fromLeft("error")))
  )({})
    .run()
    .then(ei => ei.fold(onError, constNull), onError);
};
