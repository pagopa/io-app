import { type VerifierRequest } from "@pagopa/io-react-native-proximity";
import { getProximityDetails } from "../itwProximityPresentationUtils";
import { StoredCredential } from "../../../../common/utils/itwTypesUtils";

const mockCredentialType = "org.iso.18013.5.1.mDL";
const mockCredential: StoredCredential = {
  credential: "",
  credentialType: mockCredentialType,
  format: "mso_mdoc",
  keyTag: "ee1576b6-f5ba-4f49-94c4-507e62786ebc",
  issuerConf: {} as StoredCredential["issuerConf"],
  parsedCredential: {
    family_name: {
      name: { "en-US": "Family name", "it-IT": "Cognome" },
      value: "ROSSI"
    },
    tax_id_code: {
      name: { "en-US": "Tax Id number", "it-IT": "Codice Fiscale" },
      value: 1000
    }
  },
  jwt: {
    issuedAt: "2024-09-30T07:32:49.000Z",
    expiration: "2025-09-30T07:32:50.000Z"
  }
};

describe("getProximityDetails", () => {
  it("should skip claims not present in parsedCredential", () => {
    const parsedRequest = {
      request: {
        [mockCredentialType]: {
          "org.iso.18013.5.1": {
            unknown_field: true,
            family_name: true
          },
          isAuthenticated: false
        }
      }
    } as unknown as VerifierRequest;

    const credentials: Record<string, StoredCredential> = {
      [mockCredentialType]: mockCredential
    };

    const result = getProximityDetails(parsedRequest.request, credentials);

    expect(result).toEqual([
      {
        credentialType: mockCredentialType,
        claimsToDisplay: [
          {
            id: "family_name",
            label: "Family name",
            value: "ROSSI"
          }
        ]
      }
    ]);
  });

  it("should group requested claims in parsedCredential", () => {
    const parsedRequest = {
      request: {
        [mockCredentialType]: {
          "org.iso.18013.5.1.aamva": {
            family_name: false
          },
          "org.iso.18013.5.1": {
            tax_id_code: false
          },
          isAuthenticated: false
        }
      }
    } as unknown as VerifierRequest;

    const credentials: Record<string, StoredCredential> = {
      [mockCredentialType]: mockCredential
    };

    const proximityDetails = getProximityDetails(
      parsedRequest.request,
      credentials
    );

    expect(proximityDetails).toEqual([
      {
        claimsToDisplay: [
          { id: "family_name", label: "Family name", value: "ROSSI" },
          { id: "tax_id_code", label: "Tax Id number", value: 1000 }
        ],
        credentialType: mockCredentialType
      }
    ]);
  });
});
