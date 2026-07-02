import { ITW_CREDENTIAL_OFFER_URI_PARAM, parseCredentialOfferLink } from "..";
import { IO_INTERNAL_LINK_PREFIX } from "../../../../../utils/navigation";

describe("parseCredentialOfferLink", () => {
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
      name: "IO universal link on unrelated path with credential offer parameters",
      value: "https://continua.io.pagopa.it/messages?credential_offer=abc123",
      expected: false
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
    expect(parseCredentialOfferLink(value) !== undefined).toBe(expected);
  });

  it("wraps a raw credential offer URI in the internal route", () => {
    const credentialOfferUri =
      "haip-vci://?credential_offer_uri=https%3A%2F%2Fissuer.example.com%2Foffers%2F123";
    const result = parseCredentialOfferLink(credentialOfferUri);
    const prefix = `${IO_INTERNAL_LINK_PREFIX}itw/credential-offer?${ITW_CREDENTIAL_OFFER_URI_PARAM}=`;

    expect(result?.credentialOfferUri).toBe(credentialOfferUri);
    expect(result?.internalRoute.startsWith(prefix)).toBe(true);
    expect(
      decodeURIComponent(result?.internalRoute.slice(prefix.length) ?? "")
    ).toBe(credentialOfferUri);
  });

  it("extracts the original credential offer URI from the internal route", () => {
    const credentialOfferUri =
      "openid-credential-offer://?credential_offer=%7B%22credential_issuer%22%3A%22https%3A%2F%2Fissuer.example.com%22%7D";
    const internalRoute = `${IO_INTERNAL_LINK_PREFIX}itw/credential-offer?${ITW_CREDENTIAL_OFFER_URI_PARAM}=${encodeURIComponent(
      credentialOfferUri
    )}`;

    expect(parseCredentialOfferLink(internalRoute)).toStrictEqual({
      credentialOfferUri,
      internalRoute
    });
  });

  it("normalizes malformed encoded internal routes using the raw parameter value", () => {
    const malformedRoute = `${IO_INTERNAL_LINK_PREFIX}itw/credential-offer?${ITW_CREDENTIAL_OFFER_URI_PARAM}=openid-credential-offer%ZZ`;

    expect(parseCredentialOfferLink(malformedRoute)).toStrictEqual({
      credentialOfferUri: "openid-credential-offer%ZZ",
      internalRoute: malformedRoute
    });
  });

  it("returns undefined for non credential offer invocations", () => {
    expect(
      parseCredentialOfferLink("https://continua.io.pagopa.it/messages")
    ).toBe(undefined);
  });

  it("returns undefined for IO universal links on unrelated paths", () => {
    const url =
      "https://continua.io.pagopa.it/messages?credential_offer=abc123";

    expect(parseCredentialOfferLink(url)).toBe(undefined);
  });
});
