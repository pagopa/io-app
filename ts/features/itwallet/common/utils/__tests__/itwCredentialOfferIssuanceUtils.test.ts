import { createCryptoContextFor } from "@pagopa/io-react-native-wallet";
import { Env } from "../environment";
import { requestCredential } from "../itwCredentialIssuanceUtils";
import { getIoWallet } from "../itwIoWallet";
import {
  CredentialFormat,
  CredentialOfferResolved,
  IssuerConfiguration
} from "../itwTypesUtils";

jest.mock("@pagopa/io-react-native-wallet", () => ({
  createCryptoContextFor: jest.fn(),
  Errors: {
    IssuerResponseErrorCodes: {
      CredentialInvalidStatus: "CredentialInvalidStatus"
    }
  }
}));

jest.mock("../itwIoWallet", () => ({
  getIoWallet: jest.fn()
}));

const CATALOGUE_ISSUER_URL = "https://catalogue-issuer.example.it";
const OFFER_ISSUER_URL = "https://offer-issuer.example.it";
const OFFER_AUTHORIZATION_SERVER = "https://as.offer-issuer.example.it";
const OFFER_SCOPE = "education_degree";
const OFFER_ISSUER_STATE = "issuer-session-id";
const OFFER_SD_JWT_CONFIGURATION_ID = "education_degree_sd_jwt";
const OFFER_MDOC_CONFIGURATION_ID = "education_degree_mdoc";

const env = {
  ISSUANCE_REDIRECT_URI: "ioit://issuance",
  WALLET_EAA_PROVIDER_BASE_URL: {
    value: jest.fn(() => CATALOGUE_ISSUER_URL)
  }
} as unknown as Env;

const issuerConf = {
  credential_configurations_supported: {
    [OFFER_SD_JWT_CONFIGURATION_ID]: {
      format: CredentialFormat.SD_JWT,
      scope: OFFER_SCOPE
    },
    [OFFER_MDOC_CONFIGURATION_ID]: {
      format: CredentialFormat.MDOC,
      scope: OFFER_SCOPE
    }
  }
} as unknown as IssuerConfiguration;

const credentialOffer = {
  offer: {
    credential_issuer: OFFER_ISSUER_URL,
    credential_configuration_ids: [
      OFFER_SD_JWT_CONFIGURATION_ID,
      OFFER_MDOC_CONFIGURATION_ID
    ]
  },
  grantDetails: {
    grantType: "authorization_code",
    authorizationCodeGrant: {
      authorizationServer: OFFER_AUTHORIZATION_SERVER,
      issuerState: OFFER_ISSUER_STATE,
      scope: OFFER_SCOPE
    }
  }
} as CredentialOfferResolved;

describe("requestCredential", () => {
  const evaluateIssuerTrust = jest.fn();
  const startUserAuthorization = jest.fn();
  const getRequestedCredentialToBePresented = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (createCryptoContextFor as jest.Mock).mockReturnValue("wia-crypto-context");
    (getIoWallet as jest.Mock).mockReturnValue({
      CredentialIssuance: {
        evaluateIssuerTrust,
        getRequestedCredentialToBePresented,
        startUserAuthorization
      }
    });
    evaluateIssuerTrust.mockResolvedValue({ issuerConf });
    startUserAuthorization.mockResolvedValue({
      clientId: "client-id",
      codeVerifier: "code-verifier",
      issuerRequestUri: "request-uri"
    });
    getRequestedCredentialToBePresented.mockResolvedValue({
      client_id: "client-id"
    });
  });

  it("uses the credential offer issuer, configuration ids and grant details", async () => {
    await requestCredential({
      credentialOffer,
      credentialType: OFFER_SCOPE,
      env,
      itwVersion: "1.3.3",
      skipMdocIssuance: true,
      walletInstanceAttestation: "wia-jwt"
    });

    expect(evaluateIssuerTrust).toHaveBeenCalledWith(OFFER_ISSUER_URL, {
      authorizationServer: OFFER_AUTHORIZATION_SERVER
    });
    expect(startUserAuthorization).toHaveBeenCalledWith(
      issuerConf,
      [OFFER_SD_JWT_CONFIGURATION_ID],
      { proofType: "none" },
      expect.objectContaining({
        credentialOfferGrant:
          credentialOffer.grantDetails.authorizationCodeGrant
      })
    );
  });

  it("keeps catalogue issuance on the configured issuer without credential offer grant", async () => {
    await requestCredential({
      credentialType: OFFER_SCOPE,
      env,
      itwVersion: "1.3.3",
      skipMdocIssuance: true,
      walletInstanceAttestation: "wia-jwt"
    });

    expect(evaluateIssuerTrust).toHaveBeenCalledWith(CATALOGUE_ISSUER_URL, {
      authorizationServer: undefined
    });
    expect(startUserAuthorization).toHaveBeenCalledWith(
      issuerConf,
      [OFFER_SD_JWT_CONFIGURATION_ID],
      { proofType: "none" },
      expect.not.objectContaining({
        credentialOfferGrant: expect.anything()
      })
    );
  });

  it("fails when the credential offer has no requestable configuration ids", async () => {
    await expect(
      requestCredential({
        credentialOffer: {
          ...credentialOffer,
          offer: {
            ...credentialOffer.offer,
            credential_configuration_ids: [OFFER_MDOC_CONFIGURATION_ID]
          }
        },
        credentialType: OFFER_SCOPE,
        env,
        itwVersion: "1.3.3",
        skipMdocIssuance: true,
        walletInstanceAttestation: "wia-jwt"
      })
    ).rejects.toThrow("No requestable credential configurations found");
  });
});
