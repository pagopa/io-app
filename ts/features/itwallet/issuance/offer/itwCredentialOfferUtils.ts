const CREDENTIAL_OFFER_SCHEMES = [
  "openid-credential-offer://",
  "haip-vci://"
] as const;

/**
 * Returns true if the given string looks like a credential offer URI.
 * Supports custom schemes (openid-credential-offer://, haip-vci://)
 * and HTTPS universal links with `credential_offer` or `credential_offer_uri` query params.
 */
export const isCredentialOfferUri = (value: string): boolean => {
  if (CREDENTIAL_OFFER_SCHEMES.some(scheme => value.startsWith(scheme))) {
    return true;
  }

  if (value.startsWith("https://")) {
    try {
      const url = new URL(value);
      return (
        url.searchParams.has("credential_offer") ||
        url.searchParams.has("credential_offer_uri")
      );
    } catch {
      return false;
    }
  }

  return false;
};
