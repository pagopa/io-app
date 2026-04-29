import { IO_UNIVERSAL_LINK_PREFIX } from "../../../../utils/navigation";

const CREDENTIAL_OFFER_SCHEMES = [
  "openid-credential-offer://",
  "haip-vci://",
  IO_UNIVERSAL_LINK_PREFIX
] as const;

const CREDENTIAL_OFFER_QUERY_PARAMS = [
  "credential_offer",
  "credential_offer_uri"
] as const;

export const isPotentialCredentialOfferInvocation = (
  value: string
): boolean => {
  const s = value.trim();

  if (!CREDENTIAL_OFFER_SCHEMES.some(scheme => s.startsWith(scheme))) {
    return false;
  }

  try {
    const url = new URL(s);
    return CREDENTIAL_OFFER_QUERY_PARAMS.some(param =>
      url.searchParams.has(param)
    );
  } catch {
    return false;
  }
};
