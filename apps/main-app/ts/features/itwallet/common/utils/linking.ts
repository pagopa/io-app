import { getStateFromPath } from "@react-navigation/native";

import {
  IO_INTERNAL_LINK_PREFIX,
  IO_UNIVERSAL_LINK_PREFIX
} from "../../../../utils/navigation";
import { extractPathFromURL } from "../../../../utils/url";
import { itwLinkingConfig } from "../../navigation/linking";
import { parseCredentialOfferLink } from "../../offer/utils";

const itwLinkPrefixes = [IO_INTERNAL_LINK_PREFIX, IO_UNIVERSAL_LINK_PREFIX];

/** Parsed ITW deep link data used by the deferred-link saga. */
export type ItwDeepLink = { path: string };

/** Parses a stored URL into a supported ITW navigation path. */
export const parseItwDeepLink = (url: string): ItwDeepLink | undefined => {
  const path = extractItwPath(
    parseCredentialOfferLink(url)?.internalRoute ?? url
  );

  if (path === undefined || !isSupportedItwPath(path)) {
    return undefined;
  }

  return { path };
};

/** Extracts an ITW path from an internal or universal link. */
const extractItwPath = (url: string): string | undefined => {
  const path = extractPathFromURL(itwLinkPrefixes, url.trim())?.replace(
    /^\/+/,
    ""
  );

  return path === "itw" || path?.startsWith("itw/") === true ? path : undefined;
};

/** Checks whether the ITW linking configuration supports the path. */
const isSupportedItwPath = (path: string): boolean => {
  try {
    return getStateFromPath(path, itwLinkingConfig) !== undefined;
  } catch {
    return false;
  }
};
