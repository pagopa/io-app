import { useLinkTo } from "@react-navigation/native";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { constNull, pipe } from "fp-ts/lib/function";
import { Linking } from "react-native";
import { storeUrl, webStoreURL } from "./appVersion";
import { clipboardSetStringWithFeedback } from "./clipboard";
import {
  IO_INTERNAL_LINK_PREFIX,
  IO_UNIVERSAL_LINK_PREFIX
} from "./navigation";
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
  return pipe(
    url,
    u => splitAndTakeFirst(u, "?"),
    u => splitAndTakeFirst(u, "#")
  );
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
  valueType?: ItemAction,
  onSuccess: () => void = constNull,
  onError: () => void = constNull
): () => void {
  switch (valueType) {
    case "MAP":
      return () => openMaps(value);
    case "COPY":
      return () => clipboardSetStringWithFeedback(value);
    default:
      return () => Linking.openURL(value).then(onSuccess).catch(onError);
  }
}

export const isHttp = (url: string): boolean => {
  const urlLower = url.trim().toLocaleLowerCase();
  return urlLower.match(/http(s)?:\/\//gm) !== null;
};

export const taskLinking = (url: string) =>
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
    taskCanOpenUrl(url),
    TE.chainW(v => (v ? taskLinking(url) : TE.left("error")))
  )().then(E.fold(onError, constNull), onError);
};

export const openAppStoreUrl = async (onError: () => void = constNull) => {
  try {
    await Linking.openURL(storeUrl);
  } catch (e) {
    openWebUrl(webStoreURL, onError);
  }
};

/**
 * Escape characters with special meaning either inside or outside character sets.
 * Use a simple backslash escape when it’s always valid, and a `\xnn` escape when the simpler form would be disallowed by Unicode patterns’ stricter grammar.
 */
export function escapeStringRegexp(string: string) {
  if (typeof string !== "string") {
    throw new TypeError("Expected a string");
  }

  return string.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d");
}

/**
 * Extract the path from a given url if it matches one of the given prefixes
 * @param prefixes  the prefixes to match
 * @param url the url to match
 * @returns the path if the url matches one of the prefixes, undefined otherwise
 */
export function extractPathFromURL(
  prefixes: ReadonlyArray<string>,
  url: string
): string | undefined {
  for (const prefix of prefixes) {
    const protocol = prefix.match(/^[^:]+:/)?.[0] ?? "";
    const host = prefix
      .replace(new RegExp(`^${escapeStringRegexp(protocol)}`), "")
      .replace(/\/+/g, "/") // Replace multiple slash (//) with single ones
      .replace(/^\//, ""); // Remove extra leading slash

    const prefixRegex = new RegExp(
      `^${escapeStringRegexp(protocol)}(/)*${host
        .split(".")
        .map(it => (it === "*" ? "[^/]+" : escapeStringRegexp(it)))
        .join("\\.")}`
    );

    const normalizedURL = url.replace(/\/+/g, "/");

    if (prefixRegex.test(normalizedURL)) {
      return normalizedURL.replace(prefixRegex, "");
    }
  }

  return undefined;
}

/**
 * This hook handles deep links. It removes the prefix and navigates to the path using the linkTo function
 * @returns a function that takes a url and navigates to the path
 */
export const useOpenDeepLink = () => {
  const linkTo = useLinkTo();

  return (url: string) =>
    pipe(
      extractPathFromURL(
        [IO_INTERNAL_LINK_PREFIX, IO_UNIVERSAL_LINK_PREFIX],
        url
      ),
      O.fromNullable,
      O.map(path => (path.startsWith("/") ? path : "/" + path)),
      O.map(linkTo)
    );
};
