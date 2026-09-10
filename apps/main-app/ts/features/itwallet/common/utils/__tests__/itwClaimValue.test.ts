import I18n from "i18next";

import {
  ClaimDisplayFormat,
  getClaimDisplayValue,
  parseClaimValue,
  SimpleDate,
  WellKnownClaim
} from "../itwClaimsUtils";

const PNG_BASE64 =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAEElEQVR4nGKKrzEGBAAA//8CVAERMRFlewAAAABJRU5ErkJggg==";
const PDF_BASE64 = "data:application/pdf;base64,JVBERi0xLjQK";

const parsedKind = (value: unknown) =>
  parseClaimValue(value).match(
    parsed => parsed.kind,
    () => "<unparsed>"
  );

const claim = (value: unknown, id = "a_claim"): ClaimDisplayFormat => ({
  id,
  label: "A claim",
  value
});

/**
 * The order of the `ClaimValue` union members decides which kind a raw value is resolved to, and
 * every rendering path switches on that kind. These cases pin the resolution down so that adding
 * or reordering a member cannot silently change how a claim is displayed.
 */
describe("parseClaimValue", () => {
  it.each([
    ["a place of birth", { country: "IT", locality: "Rome" }, "placeOfBirth"],
    [
      "the mDL driving privileges, raw format",
      [
        {
          vehicle_category_code: { name: "Categoria", value: "B" },
          issue_date: { name: "Rilascio", value: "2013-10-19" },
          expiry_date: { name: "Scadenza", value: "2034-04-04" }
        }
      ],
      "drivingPrivileges"
    ],
    [
      "the mDL driving privileges, flat mDoc format",
      [
        {
          vehicle_category_code: "B",
          issue_date: "2013-10-19",
          expiry_date: "2034-04-04"
        }
      ],
      "drivingPrivileges"
    ],
    [
      "the mDL driving privileges, legacy JSON string format",
      '[{"driving_privilege":"AM","issue_date":"1935-01-23","expiry_date":"2035-02-16","restrictions_conditions":""}]',
      "drivingPrivileges"
    ],
    [
      "a nested object",
      { first_name: { value: "Mario", name: "Nome" } },
      "nestedObject"
    ],
    [
      "a nested array",
      [{ first_name: { value: "Mario", name: "Nome" } }],
      "nestedArray"
    ],
    ["a date", "2024-11-19", "date"],
    ["an image", PNG_BASE64, "image"],
    ["a PDF", PDF_BASE64, "pdf"],
    ["a fiscal code", "TINIT-MRARSS00A01H501B", "fiscalCode"],
    ["a boolean", true, "bool"],
    ["a URL", "https://example.org/doc", "url"],
    ["a list of strings", ["IT", "EN"], "list"],
    ["a plain string", "Mario", "string"],
    ["an empty string", "", "emptyString"]
  ])("resolves %s to the %p kind", (_name, value, expected) => {
    expect(parsedKind(value)).toBe(expected);
  });

  it.each([
    ["an empty string", "", "emptyString"],
    ["a URL", "https://example.org", "url"],
    ["a PDF", PDF_BASE64, "pdf"],
    ["a date", "2024-11-19", "date"]
  ])(
    "resolves %s to %p rather than falling back to the string kind",
    (_name, value, expected) => {
      expect(parsedKind(value)).toBe(expected);
    }
  );

  // An empty array satisfies every array schema, so it is captured by the first one in the union.
  // Nothing is rendered for it either way, but the resolution is order-dependent and worth pinning.
  it("resolves an empty array to the first matching array kind", () => {
    expect(parsedKind([])).toBe("drivingPrivileges");
  });

  it("fails on a value that matches no kind", () => {
    expect(parseClaimValue({ unexpected: 42 }).isErr()).toBe(true);
  });
});

describe("getClaimDisplayValue", () => {
  it("renders a place of birth as locality and country", () => {
    expect(
      getClaimDisplayValue(claim({ country: "IT", locality: "Rome" }))
    ).toEqual({ renderAs: "text", value: "Rome (IT)" });
  });

  it("renders a date in the default format", () => {
    expect(getClaimDisplayValue(claim("2024-11-19"))).toEqual({
      renderAs: "text",
      value: "19/11/2024"
    });
  });

  it("renders an image claim as an image", () => {
    expect(getClaimDisplayValue(claim(PNG_BASE64))).toEqual({
      renderAs: "image",
      value: PNG_BASE64
    });
  });

  it("strips the TINIT prefix from a fiscal code", () => {
    expect(getClaimDisplayValue(claim("TINIT-MRARSS00A01H501B"))).toEqual({
      renderAs: "text",
      value: "MRARSS00A01H501B"
    });
  });

  it("renders a list claim as a list", () => {
    expect(getClaimDisplayValue(claim(["IT", "EN"]))).toEqual({
      renderAs: "list",
      value: ["IT", "EN"]
    });
  });

  it("renders a boolean claim with its localized label", () => {
    expect(getClaimDisplayValue(claim(true))).toEqual({
      renderAs: "text",
      value: I18n.t(
        "features.itWallet.presentation.credentialDetails.boolClaim.true"
      )
    });
  });

  it("renders the driving privileges with their parsed dates", () => {
    const displayValue = getClaimDisplayValue(
      claim(
        '[{"driving_privilege":"AM","issue_date":"1935-01-23","expiry_date":"2035-02-16","restrictions_conditions":""}]'
      )
    );

    expect(displayValue).toEqual({
      renderAs: "drivingPrivileges",
      value: [
        {
          driving_privilege: "AM",
          issue_date: expect.any(SimpleDate),
          expiry_date: expect.any(SimpleDate),
          restrictions_conditions: ""
        }
      ]
    });
  });

  it("flattens a nested object into displayable claims", () => {
    expect(
      getClaimDisplayValue(
        claim({ first_name: { value: "Mario", name: "Nome" } })
      )
    ).toEqual({
      renderAs: "nestedObject",
      value: [{ id: "first_name", label: "Nome", value: "Mario" }]
    });
  });

  // The portrait is the only claim whose raw base64 payload carries no data URL prefix, so it is
  // resolved as a plain string and must still be displayed as an image.
  it("renders the portrait claim as an image", () => {
    expect(
      getClaimDisplayValue(claim("iVBORw0KGgo", WellKnownClaim.portrait))
    ).toEqual({
      renderAs: "image",
      value: expect.stringMatching(/^data:image\/jpeg;base64,/)
    });
  });

  // PDF and URL claims have no dedicated branch: they used to reach the string fallback through
  // the decoders' order, and must keep being rendered as plain text.
  it.each([
    ["a PDF", PDF_BASE64],
    ["a URL", "https://example.org/doc"]
  ])("renders %s claim as text", (_name, value) => {
    expect(getClaimDisplayValue(claim(value))).toEqual({
      renderAs: "text",
      value
    });
  });

  it("falls back to the placeholder when the claim cannot be parsed", () => {
    expect(getClaimDisplayValue(claim({ unexpected: 42 }))).toEqual({
      renderAs: "text",
      value: I18n.t("features.itWallet.generic.placeholders.claimNotAvailable")
    });
  });
});
