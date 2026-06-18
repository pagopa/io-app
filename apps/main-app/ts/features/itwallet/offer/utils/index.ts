import {
  IO_INTERNAL_LINK_PREFIX,
  IO_UNIVERSAL_LINK_PREFIX
} from "../../../../utils/navigation";

export const ITW_CREDENTIAL_OFFER_LINKING_PREFIXES = [
  "openid-credential-offer://",
  "haip-vci://"
] as const;

const CREDENTIAL_OFFER_QUERY_PARAMS = [
  "credential_offer",
  "credential_offer_uri"
] as const;

export const ITW_CREDENTIAL_OFFER_LINKING_PATH = "credential-offer" as const;
const ITW_CREDENTIAL_OFFER_INTERNAL_PATH =
  `itw/${ITW_CREDENTIAL_OFFER_LINKING_PATH}` as const;
const ITW_CREDENTIAL_OFFER_UNIVERSAL_LINK_PATH =
  `/${ITW_CREDENTIAL_OFFER_INTERNAL_PATH}` as const;
const ITW_CREDENTIAL_OFFER_URI_PARAM = "itwCredentialOfferUri" as const;
const IO_UNIVERSAL_LINK_ORIGIN = new URL(IO_UNIVERSAL_LINK_PREFIX).origin;

const hasCredentialOfferQueryParam = (url: URL) =>
  CREDENTIAL_OFFER_QUERY_PARAMS.some(param => url.searchParams.has(param));

const isCredentialOfferCustomScheme = (value: string) =>
  ITW_CREDENTIAL_OFFER_LINKING_PREFIXES.some(prefix =>
    value.startsWith(prefix)
  );

const isCredentialOfferUniversalLink = (url: URL) =>
  url.origin === IO_UNIVERSAL_LINK_ORIGIN &&
  url.pathname === ITW_CREDENTIAL_OFFER_UNIVERSAL_LINK_PATH;

/**
 * Checks if the provided URL is a credential offer invocation accepted by IT Wallet.
 */
export const isPotentialCredentialOfferInvocation = (
  value: string
): boolean => {
  const s = value.trim();

  try {
    const url = new URL(s);
    return (
      hasCredentialOfferQueryParam(url) &&
      (isCredentialOfferCustomScheme(s) || isCredentialOfferUniversalLink(url))
    );
  } catch {
    return false;
  }
};

/**
 * Builds the internal route used by React Navigation while preserving the original credential offer URI.
 */
export const getCredentialOfferInternalRoute = (
  credentialOfferUri: string
): string =>
  `${IO_INTERNAL_LINK_PREFIX}${ITW_CREDENTIAL_OFFER_INTERNAL_PATH}?${ITW_CREDENTIAL_OFFER_URI_PARAM}=${encodeURIComponent(
    credentialOfferUri
  )}`;
