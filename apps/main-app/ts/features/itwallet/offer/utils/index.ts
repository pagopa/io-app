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
export const ITW_CREDENTIAL_OFFER_URI_PARAM = "itwCredentialOfferUri" as const;

export type CredentialOfferLink = {
  credentialOfferUri: string;
  internalRoute: string;
};

/**
 * Parses a credential offer invocation and returns the route used internally by React Navigation.
 * Raw custom schemes and universal links are preserved as the credential offer URI, while already
 * normalized internal routes expose the original URI stored in the query parameter.
 */
export const parseCredentialOfferLink = (
  value: string
): CredentialOfferLink | undefined => {
  const trimmedValue = value.trim();

  try {
    const url = new URL(trimmedValue);
    const isAcceptedCustomScheme = ITW_CREDENTIAL_OFFER_LINKING_PREFIXES.some(
      scheme => trimmedValue.startsWith(scheme)
    );
    const isAcceptedUniversalLink =
      url.origin === IO_UNIVERSAL_LINK_PREFIX &&
      url.pathname.replace(/^\//, "") === ITW_CREDENTIAL_OFFER_INTERNAL_PATH;

    const isInternalCredentialOfferRoute =
      trimmedValue.startsWith(IO_INTERNAL_LINK_PREFIX) &&
      url.hostname === "itw" &&
      url.pathname.replace(/^\//, "") === ITW_CREDENTIAL_OFFER_LINKING_PATH;

    if (isInternalCredentialOfferRoute || isAcceptedUniversalLink) {
      const originalCredentialOfferUri = url.searchParams.get(
        ITW_CREDENTIAL_OFFER_URI_PARAM
      );

      if (originalCredentialOfferUri) {
        return {
          credentialOfferUri: originalCredentialOfferUri,
          internalRoute: trimmedValue
        };
      }
    }

    const hasCredentialOfferPayload = CREDENTIAL_OFFER_QUERY_PARAMS.some(
      param => url.searchParams.has(param)
    );

    if (!hasCredentialOfferPayload) {
      return undefined;
    }

    if (!isAcceptedCustomScheme && !isAcceptedUniversalLink) {
      return undefined;
    }

    return {
      credentialOfferUri: trimmedValue,
      internalRoute: `${IO_INTERNAL_LINK_PREFIX}${ITW_CREDENTIAL_OFFER_INTERNAL_PATH}?${ITW_CREDENTIAL_OFFER_URI_PARAM}=${encodeURIComponent(
        trimmedValue
      )}`
    };
  } catch {
    return undefined;
  }
};
