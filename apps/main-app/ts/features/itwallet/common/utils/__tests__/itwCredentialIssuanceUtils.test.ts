import { generate } from "@pagopa/io-react-native-crypto";

import { Env } from "../environment";
import { getWalletUnitAttestation } from "../itwAttestationUtils";
import {
  generateKeysWithWalletUnitAttestation,
  requestCredential
} from "../itwCredentialIssuanceUtils";
import { getIoWallet } from "../itwIoWallet";
import {
  CredentialAccessToken,
  CredentialBundle,
  CredentialFormat
} from "../itwTypesUtils";

jest.mock("@pagopa/io-react-native-crypto", () => ({ generate: jest.fn() }));
jest.mock("@pagopa/io-react-native-wallet", () => ({
  ...jest.requireActual("@pagopa/io-react-native-wallet"),
  createCryptoContextFor: jest.fn(() => ({
    getPublicKey: jest.fn(() => Promise.resolve({ kid: "client-id" }))
  }))
}));
jest.mock("../itwAttestationUtils", () => ({
  getWalletUnitAttestation: jest.fn()
}));
jest.mock("../itwIoWallet", () => ({ getIoWallet: jest.fn() }));

describe("generateKeysWithWalletUnitAttestation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getIoWallet as jest.Mock).mockImplementation(itwVersion => ({
      WalletUnitAttestation: {
        isSupported: itwVersion === "1.3.3"
      }
    }));
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

describe("requestCredential", () => {
  const evaluateIssuerTrust = jest.fn();
  const startUserAuthorization = jest.fn();
  const getRequestedCredentialToBePresented = jest.fn();
  const evaluateDcqlQuery = jest.fn();
  const offerCredentialIssuer = "https://issuer.example.com";
  const offerCredentialConfigurationId = "EducationDegreeCredential";
  const defaultIssuer = "https://default-issuer.example.com";
  const requestObject = {
    client_id: "client-id",
    dcql_query: { credentials: [] }
  };
  const evaluatedDcqlQueryResult = { credential_matches: {} };
  const pid: CredentialBundle = {
    credential: "pid-credential",
    metadata: { keyTag: "pid-key-tag" } as CredentialBundle["metadata"]
  };

  const env = {
    WALLET_EAA_PROVIDER_BASE_URL: {
      value: jest.fn(() => defaultIssuer)
    },
    ISSUANCE_REDIRECT_URI: "ioit://credential"
  } as unknown as Env;

  beforeEach(() => {
    jest.clearAllMocks();
    evaluateIssuerTrust.mockResolvedValue({
      issuerConf: {
        credential_issuer: offerCredentialIssuer,
        credential_configurations_supported: {
          [offerCredentialConfigurationId]: {
            scope: "education_degree",
            format: "vc+sd-jwt"
          }
        }
      }
    });
    startUserAuthorization.mockResolvedValue({
      issuerRequestUri: "request-uri",
      clientId: "client-id",
      codeVerifier: "code-verifier",
      responseMode: "query"
    });
    getRequestedCredentialToBePresented.mockResolvedValue(requestObject);
    evaluateDcqlQuery.mockResolvedValue(evaluatedDcqlQueryResult);
    (getIoWallet as jest.Mock).mockReturnValue({
      CredentialIssuance: {
        evaluateIssuerTrust,
        startUserAuthorization,
        getRequestedCredentialToBePresented
      },
      RemotePresentation: {
        evaluateDcqlQuery
      }
    });
  });

  it("uses the resolved credential offer issuer and configuration IDs", async () => {
    const result = await requestCredential({
      env,
      itwVersion: "1.3.3",
      credentialType: "education_degree",
      walletInstanceAttestation: "wia",
      skipMdocIssuance: true,
      pid,
      resolvedCredentialOffer: {
        offer: {
          credential_issuer: offerCredentialIssuer,
          credential_configuration_ids: [offerCredentialConfigurationId],
          grants: {
            authorization_code: {
              scope: "education_degree",
              authorization_server: offerCredentialIssuer,
              issuer_state: "issuer-state"
            }
          }
        },
        grantDetails: {
          grantType: "authorization_code",
          authorizationCodeGrant: {
            scope: "education_degree",
            authorizationServer: offerCredentialIssuer,
            issuerState: "issuer-state"
          }
        }
      }
    });

    expect(evaluateIssuerTrust).toHaveBeenCalledWith(offerCredentialIssuer);
    expect(env.WALLET_EAA_PROVIDER_BASE_URL.value).not.toHaveBeenCalled();
    expect(startUserAuthorization).toHaveBeenCalledWith(
      expect.any(Object),
      [offerCredentialConfigurationId],
      { proofType: "none" },
      expect.objectContaining({
        walletInstanceAttestation: "wia"
      })
    );
    expect(evaluateDcqlQuery).toHaveBeenCalledWith(requestObject.dcql_query, [
      [pid.metadata.keyTag, pid.credential]
    ]);
    expect(result.evaluatedDcqlQuery).toBe(evaluatedDcqlQueryResult);
  });

  it("rejects resolved credential offers without supported configuration IDs", async () => {
    evaluateIssuerTrust.mockResolvedValue({
      issuerConf: {
        credential_issuer: offerCredentialIssuer,
        credential_configurations_supported: {
          AnotherCredential: {
            scope: "another_credential",
            format: CredentialFormat.SD_JWT
          },
          MdocCredential: {
            scope: "education_degree",
            format: CredentialFormat.MDOC
          }
        }
      }
    });

    await expect(
      requestCredential({
        env,
        itwVersion: "1.3.3",
        credentialType: "education_degree",
        walletInstanceAttestation: "wia",
        skipMdocIssuance: true,
        pid,
        resolvedCredentialOffer: {
          offer: {
            credential_issuer: offerCredentialIssuer,
            credential_configuration_ids: [
              "UnknownCredential",
              "AnotherCredential",
              "MdocCredential"
            ],
            grants: {
              authorization_code: {
                scope: "education_degree",
                authorization_server: offerCredentialIssuer,
                issuer_state: "issuer-state"
              }
            }
          },
          grantDetails: {
            grantType: "authorization_code",
            authorizationCodeGrant: {
              scope: "education_degree",
              authorizationServer: offerCredentialIssuer,
              issuerState: "issuer-state"
            }
          }
        }
      })
    ).rejects.toThrow("No supported credential configuration IDs");

    expect(startUserAuthorization).not.toHaveBeenCalled();
  });
});
