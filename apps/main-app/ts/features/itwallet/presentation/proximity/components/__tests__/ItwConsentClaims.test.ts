import { CredentialMetadata } from "../../../../common/utils/itwTypesUtils";
import { StoredConsentData } from "../../store/types";
import { getConsentClaimsByCredential } from "../ItwConsentClaims";

const mdocCredential = {
  credentialType: "mDL",
  parsedCredential: {
    "org.iso.18013.5.1:given_name": {
      name: { "it-IT": "Nome" },
      value: "Anna"
    },
    "org.iso.18013.5.1:family_name": {
      name: { "it-IT": "Cognome" },
      value: "Verdi"
    }
  }
} as unknown as CredentialMetadata;

describe("getConsentClaimsByCredential", () => {
  it("resolves only consented namespaced claims from the mdoc credential", () => {
    const consent: StoredConsentData = {
      credentials: [
        {
          claimNames: [
            "org.iso.18013.5.1:given_name",
            "org.iso.18013.5.1:missing"
          ],
          credentialType: "mDL"
        }
      ],
      rpId: "verifier.example.it"
    };

    expect(
      getConsentClaimsByCredential(consent, { mDL: mdocCredential })
    ).toEqual([
      {
        claims: [
          {
            id: "org.iso.18013.5.1:given_name",
            label: "Nome",
            value: "Anna"
          }
        ],
        credentialType: "mDL"
      }
    ]);
  });

  it("ignores credentials that are no longer stored", () => {
    const consent: StoredConsentData = {
      credentials: [{ claimNames: ["given_name"], credentialType: "mDL" }],
      rpId: "verifier.example.it"
    };

    expect(getConsentClaimsByCredential(consent, {})).toEqual([]);
  });
});
