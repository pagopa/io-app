import {
  getCredentialOfferInternalRoute,
  isPotentialCredentialOfferInvocation,
  normalizeCredentialOfferDeepLink
} from "..";
import { IO_INTERNAL_LINK_PREFIX } from "../../../../../utils/navigation";

describe("isPotentialCredentialOfferInvocation", () => {
  it.each([
    {
      name: "openid credential offer with embedded offer",
      value:
        "openid-credential-offer://?credential_offer=%7B%22credential_issuer%22%3A%22https%3A%2F%2Fissuer.example.com%22%7D",
      expected: true
    },
    {
      name: "HAIP credential offer with offer URI",
      value:
        "haip-vci://?credential_offer_uri=https%3A%2F%2Fissuer.example.com%2Foffers%2F123",
      expected: true
    },
    {
      name: "IO universal link with embedded offer",
      value:
        "https://continua.io.pagopa.it/itw/credential-offer?credential_offer=abc123",
      expected: true
    },
    {
      name: "accepted scheme without credential offer parameters",
      value: "haip-vci://?foo=bar",
      expected: false
    },
    {
      name: "unsupported scheme with credential offer parameters",
      value: "https://wallet.example.com/?credential_offer=abc123",
      expected: false
    }
  ])("returns $expected for $name", ({ value, expected }) => {
    expect(isPotentialCredentialOfferInvocation(value)).toBe(expected);
  });
});

describe("getCredentialOfferInternalRoute", () => {
  it("wraps the original credential offer URI in the internal route", () => {
    const credentialOfferUri =
      "haip-vci://?credential_offer_uri=https%3A%2F%2Fissuer.example.com%2Foffers%2F123";

    const result = getCredentialOfferInternalRoute(credentialOfferUri);
    const prefix = `${IO_INTERNAL_LINK_PREFIX}itw/credential-offer?itwCredentialOfferUri=`;

    expect(result.startsWith(prefix)).toBe(true);
    expect(decodeURIComponent(result.slice(prefix.length))).toBe(
      credentialOfferUri
    );
  });
});

describe("normalizeCredentialOfferDeepLink", () => {
  it("returns the internal route for a credential offer invocation", () => {
    const credentialOfferUri =
      "openid-credential-offer://?credential_offer=%7B%22credential_issuer%22%3A%22https%3A%2F%2Fissuer.example.com%22%7D";

    expect(normalizeCredentialOfferDeepLink(credentialOfferUri)).toBe(
      getCredentialOfferInternalRoute(credentialOfferUri)
    );
  });

  it("returns the original URL for non credential offer invocations", () => {
    const url = "https://continua.io.pagopa.it/messages";

    expect(normalizeCredentialOfferDeepLink(url)).toBe(url);
  });
});
