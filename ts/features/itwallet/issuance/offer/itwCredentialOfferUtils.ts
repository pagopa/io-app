export const CREDENTIAL_OFFER_SCHEMES = [
  "openid-credential-offer:",
  "haip-vci:"
] as const;

export const ITW_CREDENTIAL_OFFER_PATH = "credential-offer";

/**
 * Returns true if the URL uses a credential offer custom scheme
 * (openid-credential-offer://, haip-vci://).
 * HTTPS universal links are handled by React Navigation linking config instead.
 */
export const isCredentialOfferCustomScheme = (url: string): boolean =>
  CREDENTIAL_OFFER_SCHEMES.some(scheme =>
    url.trim().toLowerCase().startsWith(scheme)
  );

/**
 * Returns true if the given string looks like a credential offer URI.
 * Supports:
 * - custom schemes (openid-credential-offer://, haip-vci://)
 * - HTTPS universal links with `credential_offer` or `credential_offer_uri`
 */
export const isCredentialOfferUri = (value: string): boolean => {
  const v = value.trim();

  if (isCredentialOfferCustomScheme(v)) {
    return true;
  }

  try {
    const url = new URL(v);
    return (
      url.searchParams.has("credential_offer") ||
      url.searchParams.has("credential_offer_uri")
    );
  } catch {
    return false;
  }
};

/**
 * Converts a credential offer custom scheme URI to a relative navigation path.
 *
 * Custom schemes like openid-credential-offer:// and haip-vci:// are not
 * supported by React Navigation, which expects paths starting with '/'.
 * This function extracts the known credential offer query params and builds
 * a relative path that matches the linking config route.
 *
 * Only `credential_offer` and `credential_offer_uri` are forwarded —
 * any other params from the custom scheme are intentionally ignored.
 *
 * @example
 * // By value
 * toCredentialOfferRelativePath("openid-credential-offer://?credential_offer=...")
 * // → "/itw/credential-offer?credential_offer=..."
 *
 * // By reference
 * toCredentialOfferRelativePath("haip-vci://?credential_offer_uri=https://...")
 * // → "/itw/credential-offer?credential_offer_uri=https://..."
 */
export const toCredentialOfferRelativePath = (href: string): string => {
  const u = new URL(href);
  const out = new URLSearchParams();

  const offer = u.searchParams.get("credential_offer");
  const offerUri = u.searchParams.get("credential_offer_uri");

  if (offer) {
    out.set("credential_offer", offer);
  }
  if (offerUri) {
    out.set("credential_offer_uri", offerUri);
  }

  const qs = out.toString();
  return qs
    ? `/itw/${ITW_CREDENTIAL_OFFER_PATH}?${qs}`
    : `/itw/${ITW_CREDENTIAL_OFFER_PATH}`;
};
