import {
  IO_INTERNAL_LINK_PREFIX,
  IO_UNIVERSAL_LINK_PREFIX
} from "../../../../utils/navigation";

export const ITW_CREDENTIAL_OFFER_LINKING_PREFIXES = [
  "openid-credential-offer://",
  "haip-vci://"
] as const;

const CREDENTIAL_OFFER_URL_PREFIXES = [
  ...ITW_CREDENTIAL_OFFER_LINKING_PREFIXES,
  IO_UNIVERSAL_LINK_PREFIX
] as const;

const CREDENTIAL_OFFER_QUERY_PARAMS = [
  "credential_offer",
  "credential_offer_uri"
] as const;

export const ITW_CREDENTIAL_OFFER_LINKING_PATH = "credential-offer" as const;
const ITW_CREDENTIAL_OFFER_INTERNAL_PATH =
  `itw/${ITW_CREDENTIAL_OFFER_LINKING_PATH}` as const;
export const ITW_CREDENTIAL_OFFER_URI_PARAM = "itwCredentialOfferUri" as const;

/**
 * Checks if the provided URL is a credential offer invocation accepted by IT Wallet.
 */
export const isPotentialCredentialOfferInvocation = (
  value: string
): boolean => {
  const trimmedValue = value.trim();

  if (
    !CREDENTIAL_OFFER_URL_PREFIXES.some(scheme =>
      trimmedValue.startsWith(scheme)
    )
  ) {
    return false;
  }

  try {
    const url = new URL(trimmedValue);
    return CREDENTIAL_OFFER_QUERY_PARAMS.some(param =>
      url.searchParams.has(param)
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

/**
 * Converts external credential offer invocations into the internal route handled by React Navigation.
 */
export const normalizeCredentialOfferDeepLink = (url: string): string =>
  isPotentialCredentialOfferInvocation(url)
    ? getCredentialOfferInternalRoute(url)
    : url;

/**
 * Extracts the original credential offer URI from either a raw invocation or the normalized internal route.
 */
export const getCredentialOfferUriFromLinkingUrl = (
  url: string
): string | undefined => {
  if (isPotentialCredentialOfferInvocation(url)) {
    return url;
  }

  try {
    const parsedUrl = new URL(url);
    const isInternalCredentialOfferRoute =
      url.startsWith(IO_INTERNAL_LINK_PREFIX) &&
      parsedUrl.hostname === "itw" &&
      parsedUrl.pathname.replace(/^\//, "") ===
        ITW_CREDENTIAL_OFFER_LINKING_PATH;

    const isUniversalCredentialOfferRoute =
      url.startsWith(IO_UNIVERSAL_LINK_PREFIX) &&
      parsedUrl.pathname.replace(/^\//, "") ===
        ITW_CREDENTIAL_OFFER_INTERNAL_PATH;

    if (!isInternalCredentialOfferRoute && !isUniversalCredentialOfferRoute) {
      return undefined;
    }

    return (
      parsedUrl.searchParams.get(ITW_CREDENTIAL_OFFER_URI_PARAM) ?? undefined
    );
  } catch {
    return undefined;
  }
};
