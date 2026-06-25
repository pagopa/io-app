import { generate } from "@pagopa/io-react-native-crypto";

import { Env } from "../environment";
import { getWalletUnitAttestation } from "../itwAttestationUtils";
import { generateKeysWithWalletUnitAttestation } from "../itwCredentialIssuanceUtils";
import { CredentialAccessToken } from "../itwTypesUtils";

jest.mock("@pagopa/io-react-native-crypto", () => ({ generate: jest.fn() }));
jest.mock("../itwAttestationUtils", () => ({
  getWalletUnitAttestation: jest.fn()
}));

describe("generateKeysWithWalletUnitAttestation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockAccessToken: CredentialAccessToken = {
    access_token: "",
    authorization_details: [
      {
        type: "openid_credential",
        credential_configuration_id: "credential-config-id",
        credential_identifiers: ["credential-id-1"]
      }
    ],
    token_type: "DPoP"
  };

  it("should generate a wallet unit attestation when supported, skipping direct key generation", async () => {
    (getWalletUnitAttestation as jest.Mock).mockImplementation(() => "wua-jwt");

    const result = await generateKeysWithWalletUnitAttestation(
      mockAccessToken,
      {
        env: {} as Env,
        itwVersion: "1.3.3",
        hardwareKeyTag: "hardware-key",
        sessionToken: "session-token"
      }
    );
    expect(generate).not.toHaveBeenCalled();
    expect(getWalletUnitAttestation).toHaveBeenCalledTimes(1);
    expect(result).toEqual([
      {
        keyTag: expect.any(String),
        authDetails: {
          type: "openid_credential",
          credential_configuration_id: "credential-config-id",
          credential_identifiers: ["credential-id-1"]
        },
        walletUnitAttestation: "wua-jwt",
        walletUnitAttestationId: expect.any(String)
      }
    ]);
  });

  it("should only generate keys when the wallet unit attestation is not supported", async () => {
    const result = await generateKeysWithWalletUnitAttestation(
      mockAccessToken,
      {
        env: {} as Env,
        itwVersion: "1.0.0",
        hardwareKeyTag: "hardware-key",
        sessionToken: "session-token"
      }
    );
    expect(generate).toHaveBeenCalledTimes(1);
    expect(getWalletUnitAttestation).not.toHaveBeenCalled();
    expect(result).toEqual([
      {
        keyTag: expect.any(String),
        authDetails: {
          type: "openid_credential",
          credential_configuration_id: "credential-config-id",
          credential_identifiers: ["credential-id-1"]
        }
      }
    ]);
  });
});
