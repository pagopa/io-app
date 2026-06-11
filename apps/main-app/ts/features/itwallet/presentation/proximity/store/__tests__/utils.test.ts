import {
  generateConsentKey,
  getConsentDataFromProximityDetails
} from "../utils";
import type { ConsentData } from "../types";
import type { ProximityDetails } from "../../utils/types";

const makeClaim = (id: string) => ({ id, label: id, value: id });

describe("generateConsentKey", () => {
  it("produces the expected format for a single credential with a single claim", () => {
    const consent: ConsentData = {
      rpId: "rp1",
      credentials: [{ credentialType: "MDL", claimNames: ["given_name"] }]
    };

    expect(generateConsentKey(consent)).toBe("rp1::MDL:given_name");
  });

  it("sorts claim names alphabetically within a credential", () => {
    const consent: ConsentData = {
      rpId: "rp1",
      credentials: [
        {
          credentialType: "MDL",
          claimNames: ["given_name", "birth_date", "age"]
        }
      ]
    };

    expect(generateConsentKey(consent)).toBe(
      "rp1::MDL:age,birth_date,given_name"
    );
  });

  it("sorts credentials alphabetically by credentialType", () => {
    const consent: ConsentData = {
      rpId: "rp1",
      credentials: [
        { credentialType: "PID", claimNames: ["given_name"] },
        { credentialType: "MDL", claimNames: ["portrait"] }
      ]
    };

    expect(generateConsentKey(consent)).toBe(
      "rp1::MDL:portrait::PID:given_name"
    );
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
