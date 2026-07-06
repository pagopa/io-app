import { renderHook } from "@testing-library/react-native";

import { ITW_ROUTES } from "../routes";
import { useItwLinkingOptions } from "../useItwLinkingOptions";

const getCredentialOfferUriParser = () => {
  const { result } = renderHook(() => useItwLinkingOptions());
  const itwLinkingOptions = result.current[ITW_ROUTES.MAIN] as {
    screens: Record<
      string,
      {
        parse: {
          itwCredentialOfferUri: (value: string) => string;
        };
      }
    >;
  };

  return itwLinkingOptions.screens[ITW_ROUTES.ISSUANCE.CREDENTIAL_OFFER_INTRO]
    .parse.itwCredentialOfferUri;
};

describe("useItwLinkingOptions", () => {
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
