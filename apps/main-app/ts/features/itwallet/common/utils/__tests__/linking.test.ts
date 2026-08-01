import { parseItwDeepLink } from "../linking";

describe("parseItwDeepLink", () => {
  test.each([
    [
      "discovery",
      "https://continua.io.pagopa.it/itw/discovery/info",
      "itw/discovery/info"
    ],
    [
      "credential issuance",
      "https://continua.io.pagopa.it/itw/credential/issuance/mDL",
      "itw/credential/issuance/mDL"
    ],
    [
      "credential reissuance",
      "ioit://itw/credential/reissuance/eid",
      "itw/credential/reissuance/eid"
    ],
    [
      "credential issuance continuation",
      "https://continua.io.pagopa.it/itw/credential/issuance",
      "itw/credential/issuance"
    ],
    [
      "credential detail",
      "ioit://itw/presentation/credential-detail/mDL",
      "itw/presentation/credential-detail/mDL"
    ],
    [
      "remote request validation",
      "https://continua.io.pagopa.it/itw/auth/request-validation",
      "itw/auth/request-validation"
    ]
  ])("parses supported %s route", (_, url, path) => {
    expect(parseItwDeepLink(url)).toEqual({
      path
    });
  });

  it("normalizes a raw credential offer", () => {
    const credentialOfferUri =
      "openid-credential-offer://?credential_offer=offer";

    expect(parseItwDeepLink(credentialOfferUri)).toEqual({
      path: `itw/credential-offer?itwCredentialOfferUri=${encodeURIComponent(
        credentialOfferUri
      )}`
    });
  });

  it("parses an already normalized credential offer", () => {
    const credentialOfferUri =
      "openid-credential-offer://?credential_offer=offer";
    const normalizedUrl = `ioit://itw/credential-offer?itwCredentialOfferUri=${encodeURIComponent(
      credentialOfferUri
    )}`;

    expect(parseItwDeepLink(normalizedUrl)).toEqual({
      path: `itw/credential-offer?itwCredentialOfferUri=${encodeURIComponent(
        credentialOfferUri
      )}`
    });
  });

  test.each([
    ["an unknown ITW route", "https://continua.io.pagopa.it/itw/unknown"],
    ["a non-ITW universal link", "https://example.com/itw/discovery/info"],
    ["a malformed credential offer", "openid-credential-offer://"]
  ])("returns undefined for %s", (_, url) => {
    expect(parseItwDeepLink(url)).toBeUndefined();
  });
});
