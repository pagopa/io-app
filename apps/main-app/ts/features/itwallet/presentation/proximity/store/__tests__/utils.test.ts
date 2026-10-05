import type { ProximityDetails } from "../../utils/types";
import type { ConsentData, StoredConsentData } from "../types";

import {
  generateConsentKey,
  getConsentDataFromProximityDetails
} from "../utils";

const makeClaim = (id: string) => ({ id, label: id, value: id });

describe("generateConsentKey", () => {
  const EXPECTED_SHA256_HEX_LENGTH = 64;
  const SHA256_HEX_REGEX = /^[a-f0-9]+$/;
  const EXPECTED_LEGACY_CANONICAL_SHA256 =
    "f89a018080dbb7064e5f690dab9d42550e6e8e682d67d4ff46201c46f5011708";

  it("produces a SHA-256 hex key for a single credential with a single claim", () => {
    const consent: ConsentData = {
      rpId: "rp1",
      credentials: [{ credentialType: "MDL", claimNames: ["given_name"] }]
    };

    const key = generateConsentKey(consent);

    expect(key).toHaveLength(EXPECTED_SHA256_HEX_LENGTH);
    expect(key).toMatch(SHA256_HEX_REGEX);
    expect(key).toBe(EXPECTED_LEGACY_CANONICAL_SHA256);
    expect(key).not.toContain(consent.rpId);
    expect(key).not.toContain(consent.credentials[0].credentialType);
    expect(key).not.toContain(consent.credentials[0].claimNames[0]);
  });

  it("sorts claim names alphabetically within a credential", () => {
    const consentA: ConsentData = {
      rpId: "rp1",
      credentials: [
        {
          credentialType: "MDL",
          claimNames: ["given_name", "birth_date", "age"]
        }
      ]
    };
    const consentB: ConsentData = {
      rpId: "rp1",
      credentials: [
        {
          credentialType: "MDL",
          claimNames: ["age", "birth_date", "given_name"]
        }
      ]
    };

    expect(generateConsentKey(consentA)).toBe(generateConsentKey(consentB));
  });

  it("sorts credentials alphabetically by credentialType", () => {
    const consentA: ConsentData = {
      rpId: "rp1",
      credentials: [
        { credentialType: "PID", claimNames: ["given_name"] },
        { credentialType: "MDL", claimNames: ["portrait"] }
      ]
    };
    const consentB: ConsentData = {
      rpId: "rp1",
      credentials: [
        { credentialType: "MDL", claimNames: ["portrait"] },
        { credentialType: "PID", claimNames: ["given_name"] }
      ]
    };

    expect(generateConsentKey(consentA)).toBe(generateConsentKey(consentB));
  });

  it("is deterministic regardless of input order", () => {
    const consentA: ConsentData = {
      rpId: "rp42",
      credentials: [
        { credentialType: "PID", claimNames: ["tax_id", "given_name"] },
        { credentialType: "MDL", claimNames: ["portrait", "birth_date"] }
      ]
    };
    const consentB: ConsentData = {
      rpId: "rp42",
      credentials: [
        { credentialType: "MDL", claimNames: ["birth_date", "portrait"] },
        { credentialType: "PID", claimNames: ["given_name", "tax_id"] }
      ]
    };

    expect(generateConsentKey(consentA)).toBe(generateConsentKey(consentB));
  });

  it("preserves duplicate credential entries before generating the key", () => {
    const consentA: ConsentData = {
      rpId: "rp42",
      credentials: [
        { credentialType: "MDL", claimNames: ["birth_date"] },
        { credentialType: "MDL", claimNames: ["portrait", "birth_date"] }
      ]
    };
    const consentB: ConsentData = {
      rpId: "rp42",
      credentials: [
        { credentialType: "MDL", claimNames: ["birth_date", "portrait"] }
      ]
    };

    expect(generateConsentKey(consentA)).not.toBe(generateConsentKey(consentB));
  });

  test.each([
    {
      name: "rpId",
      consent: {
        rpId: "rp2",
        credentials: [{ credentialType: "MDL", claimNames: ["given_name"] }]
      }
    },
    {
      name: "credential type",
      consent: {
        rpId: "rp1",
        credentials: [{ credentialType: "PID", claimNames: ["given_name"] }]
      }
    },
    {
      name: "claim",
      consent: {
        rpId: "rp1",
        credentials: [{ credentialType: "MDL", claimNames: ["family_name"] }]
      }
    }
  ])("generates a different key when $name differs", ({ consent }) => {
    const baseConsent: ConsentData = {
      rpId: "rp1",
      credentials: [{ credentialType: "MDL", claimNames: ["given_name"] }]
    };

    expect(generateConsentKey(consent)).not.toBe(
      generateConsentKey(baseConsent)
    );
  });

  it("does not mutate the original consent object", () => {
    const credentials = [
      { credentialType: "PID", claimNames: ["z_claim", "a_claim"] },
      { credentialType: "MDL", claimNames: ["portrait"] }
    ];
    const consent: ConsentData = { rpId: "rp1", credentials };

    generateConsentKey(consent);

    expect(consent.credentials[0].credentialType).toBe("PID");
    expect(consent.credentials[0].claimNames[0]).toBe("z_claim");
  });

  it("ignores stored metadata when generating the consent key", () => {
    const consent: ConsentData = {
      credentials: [{ credentialType: "MDL", claimNames: ["given_name"] }],
      rpId: "rp1"
    };
    const storedConsent: StoredConsentData = {
      ...consent,
      rpDisplayName: "Verifier organization",
      savedAt: "2026-07-20T12:00:00.000Z"
    };

    expect(generateConsentKey(storedConsent)).toBe(generateConsentKey(consent));
  });
});

describe("getConsentDataFromProximityDetails", () => {
  it("extracts rpId from the first detail", () => {
    const details: ProximityDetails = [
      {
        rpId: "verifier.example.com",
        credentialType: "MDL",
        claimsToDisplay: [makeClaim("given_name")]
      }
    ];

    const result = getConsentDataFromProximityDetails(details);

    expect(result.rpId).toBe("verifier.example.com");
  });

  it("extracts the relying party display name from the first detail", () => {
    const details: ProximityDetails = [
      {
        rpId: "verifier.example.com",
        rpDisplayName: "Verifier organization",
        credentialType: "MDL",
        claimsToDisplay: [makeClaim("given_name")]
      }
    ];

    expect(getConsentDataFromProximityDetails(details).rpDisplayName).toBe(
      "Verifier organization"
    );
  });

  it("maps each detail to a credential with the correct credentialType and claim IDs", () => {
    const details: ProximityDetails = [
      {
        rpId: "rp1",
        credentialType: "MDL",
        claimsToDisplay: [makeClaim("portrait"), makeClaim("birth_date")]
      }
    ];

    const result = getConsentDataFromProximityDetails(details);

    expect(result.credentials).toEqual([
      { credentialType: "MDL", claimNames: ["portrait", "birth_date"] }
    ]);
  });

  it("maps multiple details to multiple credentials preserving order", () => {
    const details: ProximityDetails = [
      {
        rpId: "rp1",
        credentialType: "MDL",
        claimsToDisplay: [makeClaim("portrait")]
      },
      {
        rpId: "rp1",
        credentialType: "PID",
        claimsToDisplay: [makeClaim("given_name"), makeClaim("family_name")]
      }
    ];

    const result = getConsentDataFromProximityDetails(details);

    expect(result.credentials).toEqual([
      { credentialType: "MDL", claimNames: ["portrait"] },
      { credentialType: "PID", claimNames: ["given_name", "family_name"] }
    ]);
  });

  it("handles a detail with no claims", () => {
    const details: ProximityDetails = [
      { rpId: "rp1", credentialType: "MDL", claimsToDisplay: [] }
    ];

    const result = getConsentDataFromProximityDetails(details);

    expect(result.credentials[0].claimNames).toEqual([]);
  });
});
