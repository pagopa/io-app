import { itwLinkingOptions } from "../linking";
import { ITW_ROUTES } from "../routes";

const getCredentialOfferUriParser = () => {
  const linkingOptions = itwLinkingOptions[ITW_ROUTES.MAIN] as {
    screens: Record<
      string,
      {
        parse: {
          itwCredentialOfferUri: (value: string) => string;
        };
      }
    >;
  };

  return linkingOptions.screens[ITW_ROUTES.ISSUANCE.CREDENTIAL_OFFER_INTRO]
    .parse.itwCredentialOfferUri;
};

describe("itwLinkingOptions", () => {
  describe("credential offer route", () => {
    it("decodes encoded credential offer URI params", () => {
      const parseItwCredentialOfferUri = getCredentialOfferUriParser();
      const credentialOfferUri =
        "openid-credential-offer://?credential_offer=abc123";

      expect(
        parseItwCredentialOfferUri(encodeURIComponent(credentialOfferUri))
      ).toBe(credentialOfferUri);
    });

    it("returns the raw credential offer URI param when percent-encoding is malformed", () => {
      const parseItwCredentialOfferUri = getCredentialOfferUriParser();
      const malformedCredentialOfferUri = "openid-credential-offer%";

      expect(parseItwCredentialOfferUri(malformedCredentialOfferUri)).toBe(
        malformedCredentialOfferUri
      );
    });
  });
});
