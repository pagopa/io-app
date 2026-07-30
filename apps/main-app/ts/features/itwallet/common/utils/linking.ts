import { getStateFromPath } from "@react-navigation/native";

import {
  IO_INTERNAL_LINK_PREFIX,
  IO_UNIVERSAL_LINK_PREFIX
} from "../../../../utils/navigation";
import { extractPathFromURL } from "../../../../utils/url";
import { itwLinkingConfig } from "../../navigation/linking";
import { parseCredentialOfferLink } from "../../offer/utils";

const itwLinkPrefixes = [IO_INTERNAL_LINK_PREFIX, IO_UNIVERSAL_LINK_PREFIX];

/**
 * Parsed ITW deep link data used by the deferred-link saga.
 */
export type ItwDeepLink =
  | {
      credentialOfferUri: string;
      path: string;
      type: "credential-offer";
    }
  | {
      path: string;
      type: "navigation";
    };

/**
 * Parses a stored URL and returns a supported ITW navigation path.
 * Credential-offer URLs are normalized through the existing offer parser.
 */
export const parseItwDeepLink = (url: string): ItwDeepLink | undefined => {
  const credentialOfferLink = parseCredentialOfferLink(url);
  const path = extractItwPath(credentialOfferLink?.internalRoute ?? url);

  if (path === undefined || !isSupportedItwPath(path)) {
    return undefined;
  }

  if (credentialOfferLink !== undefined) {
    return {
      type: "credential-offer",
      path,
      credentialOfferUri: credentialOfferLink.credentialOfferUri
    };
  }

  return {
    type: "navigation",
    path
  };
};

const extractItwPath = (url: string): string | undefined => {
  const path = extractPathFromURL(itwLinkPrefixes, url.trim())?.replace(
    /^\/+/,
    ""
  );

  return path === "itw" || path?.startsWith("itw/") === true ? path : undefined;
};

const isSupportedItwPath = (path: string): boolean => {
  try {
    return getStateFromPath(path, itwLinkingConfig) !== undefined;
  } catch {
    return false;
  }
};
