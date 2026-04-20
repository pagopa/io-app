export const isPotentialCredentialOfferInvocation = (
  value: string
): boolean => {
  const s = value.trim();

  if (
    s.startsWith("openid-credential-offer://") ||
    s.startsWith("haip-vci://")
  ) {
    return true;
  }

  if (s.startsWith("https://")) {
    try {
      const url = new URL(s);
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
