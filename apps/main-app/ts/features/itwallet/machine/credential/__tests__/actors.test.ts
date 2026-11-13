import { AnyActorLogic, createActor } from "xstate";

import { getIoWallet } from "../../../common/utils/itwIoWallet";
import { testCredentialIssuanceDeps } from "../../utils/testDeps";
import {
  processCredentialOfferActor,
  ProcessCredentialOfferActorOutput
} from "../actors";

jest.mock("../../../common/utils/itwIoWallet", () => ({
  getIoWallet: jest.fn()
}));

const mockGetIoWallet = jest.mocked(getIoWallet);

const T_OFFER_URI =
  "openid-credential-offer://?credential_offer_uri=https://eaa.wallet.ipzs.it/offers/123";
const T_ISSUER_BASE_URL = "https://eaa.wallet.ipzs.it";
const T_CREDENTIAL_CONFIGURATION_ID = "EducationDegreeCredential";
const T_CREDENTIAL_TYPE = "education_degree";
const T_OFFER = {
  credential_issuer: T_ISSUER_BASE_URL,
  credential_configuration_ids: [T_CREDENTIAL_CONFIGURATION_ID],
  grants: {
    authorization_code: {
      authorization_server: T_ISSUER_BASE_URL,
      issuer_state: "issuer-state"
    }
  }
};
const T_GRANT_DETAILS = {
  grantType: "authorization_code",
  authorizationCodeGrant: {
    authorizationServer: T_ISSUER_BASE_URL,
    issuerState: "issuer-state"
  }
};
const T_ISSUER_CONF = {
  credential_configurations_supported: {
    [T_CREDENTIAL_CONFIGURATION_ID]: { scope: T_CREDENTIAL_TYPE }
  }
};

const resolveCredentialOffer = jest.fn();
const extractGrantDetails = jest.fn();
const evaluateIssuerTrust = jest.fn();

const createWallet = (isOfferSupported: boolean) => ({
  CredentialsOffer: isOfferSupported
    ? { isSupported: true, resolveCredentialOffer, extractGrantDetails }
    : { isSupported: false },
  CredentialIssuance: { evaluateIssuerTrust }
});

const runActor = async <TOutput>(
  logic: AnyActorLogic,
  input: unknown
): Promise<TOutput> =>
  new Promise((resolve, reject) => {
    const actor = createActor(logic, { input });
    actor.subscribe({
      next: snapshot => {
        if (snapshot.status === "done") {
          resolve(snapshot.output as TOutput);
        }
      },
      error: reject
    });
    actor.start();
  });

describe("processCredentialOfferActor", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resolveCredentialOffer.mockResolvedValue(T_OFFER);
    extractGrantDetails.mockReturnValue(T_GRANT_DETAILS);
    evaluateIssuerTrust.mockResolvedValue({ issuerConf: T_ISSUER_CONF });
  });

  it("resolves the credential offer when it is supported by the IT-Wallet version", async () => {
    mockGetIoWallet.mockReturnValue(createWallet(true) as never);

    const result = await runActor<ProcessCredentialOfferActorOutput>(
      processCredentialOfferActor,
      {
        credentialOfferUri: T_OFFER_URI,
        deps: testCredentialIssuanceDeps({ itwVersion: "1.4.6" })
      }
    );

    expect(mockGetIoWallet).toHaveBeenCalledWith("1.4.6");
    expect(resolveCredentialOffer).toHaveBeenCalledWith(T_OFFER_URI);
    expect(extractGrantDetails).toHaveBeenCalledWith(T_OFFER);
    expect(evaluateIssuerTrust).toHaveBeenCalledWith(T_ISSUER_BASE_URL, {
      authorizationServer: T_ISSUER_BASE_URL
    });
    expect(result).toEqual({
      credentialType: T_CREDENTIAL_TYPE,
      offer: T_OFFER,
      grantDetails: T_GRANT_DETAILS,
      issuerConf: T_ISSUER_CONF
    });
  });

  it("fails without resolving the offer when it is not supported by the IT-Wallet version", async () => {
    mockGetIoWallet.mockReturnValue(createWallet(false) as never);

    await expect(
      runActor(processCredentialOfferActor, {
        credentialOfferUri: T_OFFER_URI,
        deps: testCredentialIssuanceDeps({ itwVersion: "1.0.0" })
      })
    ).rejects.toThrow(
      "Credential offer is not supported by IT-Wallet version 1.0.0"
    );

    expect(resolveCredentialOffer).not.toHaveBeenCalled();
    expect(extractGrantDetails).not.toHaveBeenCalled();
    expect(evaluateIssuerTrust).not.toHaveBeenCalled();
  });
});
