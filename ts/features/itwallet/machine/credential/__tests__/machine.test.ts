/* eslint-disable sonarjs/no-identical-functions */
import { waitFor } from "@testing-library/react-native";
import _ from "lodash";
import {
  assign,
  createActor,
  fromPromise,
  StateFrom,
  waitFor as waitForActor
} from "xstate";
import {
  ItwStatusAssertionMocks,
  ItwStoredCredentialsMocks
} from "../../../common/utils/itwMocksUtils";
import {
  IssuerConfiguration,
  RequestObject,
  StoredCredential
} from "../../../common/utils/itwTypesUtils";
import { ItwTags } from "../../tags";
import {
  GetWalletAttestationActorOutput,
  ObtainCredentialActorInput,
  ObtainCredentialActorOutput,
  ObtainStatusAssertionActorInput,
  RequestCredentialActorInput,
  RequestCredentialActorOutput
} from "../actors";
import { Context, InitialContext } from "../context";
import { CredentialIssuanceFailureType } from "../failure";
import {
  ItwCredentialIssuanceMachine,
  itwCredentialIssuanceMachine
} from "../machine";

type MachineSnapshot = StateFrom<ItwCredentialIssuanceMachine>;

const T_WIA: string = "abcdefg";

const T_CLIENT_ID = "clientId";
const T_CODE_VERIFIER = "codeVerifier";
const T_ISSUER_CONFIG: IssuerConfiguration = {
  federation_entity: {},
  oauth_authorization_server: {
    jwks: {
      keys: []
    },
    acr_values_supported: [],
    authorization_endpoint: "",
    pushed_authorization_request_endpoint: "",
    token_endpoint: "",
    client_registration_types_supported: [],
    code_challenge_methods_supported: [],
    grant_types_supported: [],
    issuer: "",
    scopes_supported: [],
    response_modes_supported: [],
    token_endpoint_auth_methods_supported: [],
    token_endpoint_auth_signing_alg_values_supported: [],
    request_object_signing_alg_values_supported: []
  },
  openid_credential_issuer: {
    credential_configurations_supported: {},
    credential_endpoint: "",
    credential_issuer: "",
    status_attestation_endpoint: "",
    trust_frameworks_supported: [],
    evidence_supported: [],
    nonce_endpoint: "",
    revocation_endpoint: "",
    display: [],
    jwks: {
      keys: []
    }
  },
  wallet_relying_party: {
    jwks: {
      keys: []
    }
  }
};
const T_REQUESTED_CREDENTIAL: RequestObject = {
  client_id: T_CLIENT_ID,
  exp: 0,
  iat: 0,
  iss: "",
  nonce: "",
  response_mode: "direct_post.jwt",
  response_type: "vp_token",
  response_uri: "",
  scope: "",
  state: ""
};
const T_STORED_STATUS_ASSERTION: StoredCredential["storedStatusAssertion"] = {
  credentialStatus: "valid",
  statusAssertion: "abcdefghijklmnopqrstuvwxyz",
  parsedStatusAssertion: ItwStatusAssertionMocks.mdl
};

describe("itwCredentialIssuanceMachine", () => {
  const onInit = jest.fn();
  const navigateToTrustIssuerScreen = jest.fn();
  const navigateToCredentialPreviewScreen = jest.fn();
  const navigateToFailureScreen = jest.fn();
  const navigateToWallet = jest.fn();
  const closeIssuance = jest.fn();
  const storeWalletInstanceAttestation = jest.fn();
  const storeCredential = jest.fn();
  const handleSessionExpired = jest.fn();
  const trackStartAddCredential = jest.fn();
  const trackAddCredential = jest.fn();
  const trackCredentialIssuingDataShare = jest.fn();
  const trackCredentialIssuingDataShareAccepted = jest.fn();

  const verifyTrustFederation = jest.fn();
  const getWalletAttestation = jest.fn();
  const requestCredential = jest.fn();
  const obtainCredential = jest.fn();
  const obtainStatusAssertion = jest.fn();

  const isSessionExpired = jest.fn();
  const hasValidWalletInstanceAttestation = jest.fn();
  const isStatusError = jest.fn();
  const isSkipNavigation = jest.fn();
  const isEidExpired = jest.fn();

  const mockedMachine = itwCredentialIssuanceMachine.provide({
    actions: {
      onInit: assign(onInit),
      navigateToTrustIssuerScreen,
      navigateToCredentialPreviewScreen,
      navigateToFailureScreen,
      navigateToWallet,
      closeIssuance,
      storeWalletInstanceAttestation,
      storeCredential,
      handleSessionExpired,
      trackStartAddCredential,
      trackAddCredential,
      trackCredentialIssuingDataShare,
      trackCredentialIssuingDataShareAccepted
    },
    actors: {
      verifyTrustFederation: fromPromise<void>(verifyTrustFederation),
      getWalletAttestation:
        fromPromise<GetWalletAttestationActorOutput>(getWalletAttestation),
      requestCredential: fromPromise<
        RequestCredentialActorOutput,
        RequestCredentialActorInput
      >(requestCredential),
      obtainCredential: fromPromise<
        ObtainCredentialActorOutput,
        ObtainCredentialActorInput
      >(obtainCredential),
      obtainStatusAssertion: fromPromise<
        Array<StoredCredential>,
        ObtainStatusAssertionActorInput
      >(obtainStatusAssertion)
    },
    guards: {
      isSessionExpired,
      hasValidWalletInstanceAttestation,
      isStatusError,
      isEidExpired
    }
  });

  beforeEach(() => {
    onInit.mockImplementation(() => ({ walletInstanceAttestation: undefined }));
    hasValidWalletInstanceAttestation.mockImplementation(() => false);
    isEidExpired.mockImplementation(() => false);
    isSkipNavigation.mockImplementation(() => true);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("Should obtain a credential with a valid status assertion", async () => {
    hasValidWalletInstanceAttestation.mockImplementation(() => false);
    getWalletAttestation.mockImplementation(() =>
      Promise.resolve({ jwt: T_WIA })
    );
    requestCredential.mockImplementation(() =>
      Promise.resolve({
        clientId: T_CLIENT_ID,
        codeVerifier: T_CODE_VERIFIER,
        requestedCredential: T_REQUESTED_CREDENTIAL,
        issuerConf: T_ISSUER_CONFIG
      })
    );

    /**
     * Start
     */

    const actor = createActor(mockedMachine);
    actor.start();

    await waitFor(() => expect(onInit).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().value).toStrictEqual("Idle");
    expect(actor.getSnapshot().context).toStrictEqual(InitialContext);
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));

    actor.send({
      type: "select-credential",
      credentialType: "MDL",
      mode: "issuance"
    });

    expect(actor.getSnapshot().context).toMatchObject<Partial<Context>>({
      credentialType: "MDL"
    });
    expect(navigateToTrustIssuerScreen).toHaveBeenCalledTimes(0);

    /**
     * Obtaint a new WIA if not present or expired
     */

    await waitFor(() => expect(getWalletAttestation).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(storeWalletInstanceAttestation).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expect.objectContaining({
            walletInstanceAttestation: { jwt: T_WIA }
          })
        }),
        undefined
      )
    );
    await waitFor(() => expect(requestCredential).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().context).toMatchObject<Partial<Context>>({
      walletInstanceAttestation: { jwt: T_WIA },
      clientId: T_CLIENT_ID,
      codeVerifier: T_CODE_VERIFIER,
      requestedCredential: T_REQUESTED_CREDENTIAL,
      issuerConf: T_ISSUER_CONFIG
    });
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([]));

    /**
     * Start credential issuance
     */

    expect(navigateToTrustIssuerScreen).toHaveBeenCalledTimes(1);

    /**
     * Obtain credential
     */

    obtainCredential.mockImplementation(() =>
      Promise.resolve({
        credentials: [ItwStoredCredentialsMocks.mdl]
      })
    );

    obtainStatusAssertion.mockImplementation(() =>
      Promise.resolve([
        {
          ...ItwStoredCredentialsMocks.mdl,
          storedStatusAssertion: T_STORED_STATUS_ASSERTION
        }
      ])
    );

    actor.send({
      type: "confirm-trust-data"
    });

    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Issuing]));

    // Step 1: get the credential
    const intermediateState1 = await waitForActor(actor, snapshot =>
      snapshot.matches({ Issuance: "ObtainingCredential" })
    );
    expect(intermediateState1.value).toStrictEqual({
      Issuance: "ObtainingCredential"
    });
    expect(obtainCredential).toHaveBeenCalledTimes(1);

    // Step 2: get the status assertion
    const intermediateState2 = await waitForActor(actor, snapshot =>
      snapshot.matches({ Issuance: "ObtainingStatusAssertion" })
    );
    expect(intermediateState2.value).toStrictEqual({
      Issuance: "ObtainingStatusAssertion"
    });
    expect(obtainStatusAssertion).toHaveBeenCalledTimes(1);

    expect(actor.getSnapshot().value).toStrictEqual(
      "DisplayingCredentialPreview"
    );
    expect(actor.getSnapshot().context).toEqual(
      expect.objectContaining<Partial<Context>>({
        credentials: [
          {
            ...ItwStoredCredentialsMocks.mdl,
            storedStatusAssertion: T_STORED_STATUS_ASSERTION
          }
        ]
      })
    );
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([]));
    expect(navigateToCredentialPreviewScreen).toHaveBeenCalledTimes(1);

    /**
     * Store the credential
     */

    actor.send({
      type: "add-to-wallet"
    });

    expect(actor.getSnapshot().value).toStrictEqual(
      "DisplayingCredentialPreview"
    );
    expect(storeCredential).toHaveBeenCalledTimes(1);
    expect(navigateToWallet).toHaveBeenCalledTimes(1);
  });

  it("Should skip WIA obtainment if still valid", async () => {
    onInit.mockImplementation(() => ({
      walletInstanceAttestation: { jwt: T_WIA }
    }));
    hasValidWalletInstanceAttestation.mockImplementation(() => true);
    getWalletAttestation.mockImplementation(() =>
      Promise.resolve({ jwt: T_WIA })
    );
    requestCredential.mockImplementation(() =>
      Promise.resolve({
        clientId: T_CLIENT_ID,
        codeVerifier: T_CODE_VERIFIER,
        requestedCredential: T_REQUESTED_CREDENTIAL,
        issuerConf: T_ISSUER_CONFIG
      })
    );

    /**
     * Start
     */

    const actor = createActor(mockedMachine);
    actor.start();

    await waitFor(() => expect(onInit).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().value).toStrictEqual("Idle");
    expect(actor.getSnapshot().context).toStrictEqual<Context>({
      ...InitialContext,
      walletInstanceAttestation: { jwt: T_WIA }
    });
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));

    actor.send({
      type: "select-credential",
      credentialType: "MDL",
      mode: "issuance"
    });

    expect(actor.getSnapshot().context).toMatchObject<Partial<Context>>({
      credentialType: "MDL"
    });
    expect(navigateToTrustIssuerScreen).toHaveBeenCalledTimes(0);

    /**
     * Obtaint a new WIA if not present or expired
     */

    await waitFor(() => expect(getWalletAttestation).toHaveBeenCalledTimes(0));
    await waitFor(() =>
      expect(storeWalletInstanceAttestation).not.toHaveBeenCalledWith(
        expect.objectContaining({
          context: expect.objectContaining({
            walletInstanceAttestation: { jwt: T_WIA }
          })
        }),
        undefined
      )
    );
    expect(actor.getSnapshot().value).toStrictEqual("DisplayingTrustIssuer");
  });

  it("Should not store the credential if the user closes the issuance", () => {
    /** Initial part is the same as the previous test, we can start from the preview */

    const initialSnapshot: MachineSnapshot = createActor(
      itwCredentialIssuanceMachine
    ).getSnapshot();

    const snapshot: MachineSnapshot = _.merge(undefined, initialSnapshot, {
      value: "DisplayingCredentialPreview",
      context: {
        credentials: [ItwStoredCredentialsMocks.mdl]
      }
    } as MachineSnapshot);

    const actor = createActor(mockedMachine, {
      snapshot
    });
    actor.start();

    expect(actor.getSnapshot().value).toStrictEqual(
      "DisplayingCredentialPreview"
    );
    expect(actor.getSnapshot().context).toMatchObject<Partial<Context>>({
      credentials: [ItwStoredCredentialsMocks.mdl]
    });
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([]));

    actor.send({
      type: "close"
    });

    expect(actor.getSnapshot().value).toStrictEqual("Completed");
    expect(storeCredential).toHaveBeenCalledTimes(0);
    expect(navigateToWallet).toHaveBeenCalledTimes(0);
    expect(closeIssuance).toHaveBeenCalledTimes(1);
  });
  // TODO: SIW-2947 Fix this test

  /*  it("Should go to failure if wallet instance attestation obtainment fails", async () => {
    const actor = createActor(mockedMachine);
    actor.start();

    await waitFor(() => expect(onInit).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().value).toStrictEqual("Idle");
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));

    /!**
     * Initialize wallet and start credential issuance
     *!/

    verifyTrustFederation.mockImplementation(() => Promise.resolve());

    getWalletAttestation.mockImplementation(
      () =>
        new Promise((__, reject) =>
          setTimeout(() => reject("SOME FAILURE"), 10)
        )
    );

    actor.send({
      type: "select-credential",
      credentialType: "MDL",
      mode: "issuance"
    });

    await waitFor(() =>
      expect(actor.getSnapshot().value).toStrictEqual(
        "TrustFederationVerification"
      )
    );

    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));
    await waitFor(() => expect(verifyTrustFederation).toHaveBeenCalledTimes(1));

    await waitFor(() =>
      expect(actor.getSnapshot().value).toStrictEqual(
        "ObtainingWalletInstanceAttestation"
      )
    );

    expect(actor.getSnapshot().context).toMatchObject<Partial<Context>>({
      credentialType: "MDL"
    });
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));
    expect(navigateToTrustIssuerScreen).toHaveBeenCalledTimes(0);
    await waitFor(() => expect(getWalletAttestation).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(requestCredential).toHaveBeenCalledTimes(0));

    await waitFor(() =>
      expect(actor.getSnapshot().value).toStrictEqual("Failure")
    );
    expect(actor.getSnapshot().context).toMatchObject<Partial<Context>>({
      failure: {
        type: CredentialIssuanceFailureType.UNEXPECTED,
        reason: "SOME FAILURE"
      }
    });

    actor.send({
      type: "close"
    });

    expect(actor.getSnapshot().value).toStrictEqual("Failure");
    expect(closeIssuance).toHaveBeenCalledTimes(1);
  }); */

  it("Should go to failure if credential request fails", async () => {
    onInit.mockImplementation(() => ({
      walletInstanceAttestation: { jwt: T_WIA }
    }));
    hasValidWalletInstanceAttestation.mockImplementation(() => true);

    const actor = createActor(mockedMachine);
    actor.start();

    await waitFor(() => expect(onInit).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().value).toStrictEqual("Idle");
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));

    /**
     * Initialize wallet and start credential issuance
     */

    verifyTrustFederation.mockImplementation(() => Promise.resolve());

    requestCredential.mockImplementation(
      () =>
        new Promise((__, reject) =>
          setTimeout(() => reject("SOME FAILURE"), 10)
        )
    );

    actor.send({
      type: "select-credential",
      credentialType: "MDL",
      mode: "issuance"
    });

    expect(actor.getSnapshot().value).toStrictEqual(
      "TrustFederationVerification"
    );

    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));
    await waitFor(() => expect(verifyTrustFederation).toHaveBeenCalledTimes(1));

    await waitFor(() =>
      expect(actor.getSnapshot().value).toStrictEqual("RequestingCredential")
    );
    expect(actor.getSnapshot().context).toMatchObject<Partial<Context>>({
      credentialType: "MDL"
    });
    expect(navigateToTrustIssuerScreen).toHaveBeenCalledTimes(0);
    await waitFor(() => expect(getWalletAttestation).toHaveBeenCalledTimes(0));
    await waitFor(() => expect(requestCredential).toHaveBeenCalledTimes(1));

    await waitFor(() =>
      expect(actor.getSnapshot().value).toStrictEqual("Failure")
    );
    expect(actor.getSnapshot().context).toMatchObject<Partial<Context>>({
      failure: {
        type: CredentialIssuanceFailureType.UNEXPECTED,
        reason: "SOME FAILURE"
      }
    });

    actor.send({
      type: "close"
    });

    expect(actor.getSnapshot().value).toStrictEqual("Failure");
    expect(closeIssuance).toHaveBeenCalledTimes(1);
  });

  it("Should close the issuance if the user does not confirm trust issuer data", () => {
    /** Initial part is the same as the previous test, we can start from the preview */

    const initialSnapshot: MachineSnapshot = createActor(
      itwCredentialIssuanceMachine
    ).getSnapshot();

    const snapshot: MachineSnapshot = _.merge(initialSnapshot, {
      value: "DisplayingTrustIssuer"
    } as MachineSnapshot);

    const actor = createActor(mockedMachine, {
      snapshot
    });
    actor.start();

    expect(actor.getSnapshot().value).toStrictEqual("DisplayingTrustIssuer");
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([]));

    actor.send({
      type: "close"
    });

    expect(actor.getSnapshot().value).toStrictEqual("Completed");
    expect(closeIssuance).toHaveBeenCalledTimes(1);
  });

  it("Should go to failure if credential issaunce fails", async () => {
    /** Initial part is the same as the previous test, we can start from the preview */

    const initialSnapshot: MachineSnapshot = createActor(
      itwCredentialIssuanceMachine
    ).getSnapshot();

    const snapshot: MachineSnapshot = _.merge(initialSnapshot, {
      value: "DisplayingTrustIssuer"
    } as MachineSnapshot);

    const actor = createActor(mockedMachine, {
      snapshot
    });
    actor.start();

    expect(actor.getSnapshot().value).toStrictEqual("DisplayingTrustIssuer");
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([]));

    obtainCredential.mockImplementation(() => Promise.reject("SOME FAILURE"));

    actor.send({
      type: "confirm-trust-data"
    });

    expect(actor.getSnapshot().value).toStrictEqual({
      Issuance: "ObtainingCredential"
    });
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Issuing]));
    await waitFor(() => expect(obtainCredential).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(obtainStatusAssertion).not.toHaveBeenCalled());

    expect(actor.getSnapshot().value).toStrictEqual("Failure");
    expect(actor.getSnapshot().context).toMatchObject<Partial<Context>>({
      failure: {
        type: CredentialIssuanceFailureType.UNEXPECTED,
        reason: "SOME FAILURE"
      }
    });

    actor.send({
      type: "close"
    });

    expect(actor.getSnapshot().value).toStrictEqual("Failure");
    expect(closeIssuance).toHaveBeenCalledTimes(1);
  });

  it("Should navigate to the next screen if mode is 'reissaunce'", async () => {
    const actor = createActor(mockedMachine);
    actor.start();

    await waitFor(() => expect(onInit).toHaveBeenCalledTimes(1));
    isSkipNavigation.mockImplementation(() => false);

    requestCredential.mockImplementation(
      () =>
        new Promise(resolve =>
          setTimeout(
            () =>
              resolve({
                clientId: T_CLIENT_ID,
                codeVerifier: T_CODE_VERIFIER,
                requestedCredential: T_REQUESTED_CREDENTIAL,
                issuerConf: T_ISSUER_CONFIG
              }),
            10
          )
        )
    );

    verifyTrustFederation.mockImplementation(() => Promise.resolve());

    actor.send({
      type: "select-credential",
      credentialType: "MDL",
      mode: "reissuance"
    });

    await waitFor(() =>
      expect(actor.getSnapshot().value).toStrictEqual(
        "TrustFederationVerification"
      )
    );

    await waitFor(() => expect(verifyTrustFederation).toHaveBeenCalledTimes(1));

    expect(navigateToTrustIssuerScreen).toHaveBeenCalledTimes(1);

    await waitFor(() =>
      expect(actor.getSnapshot().value).toStrictEqual("DisplayingTrustIssuer")
    );
  });

  it("should not call navigateToExtendedLoadingScreen before 5000ms in TrustFederationVerification state", async () => {
    const actor = createActor(mockedMachine);
    requestCredential.mockImplementation(
      () =>
        new Promise(resolve =>
          setTimeout(
            () =>
              resolve({
                clientId: T_CLIENT_ID,
                codeVerifier: T_CODE_VERIFIER,
                requestedCredential: T_REQUESTED_CREDENTIAL,
                issuerConf: T_ISSUER_CONFIG
              }),
            10
          )
        )
    );
    verifyTrustFederation.mockImplementation(() => Promise.resolve());

    actor.start();
    actor.send({
      type: "select-credential",
      credentialType: "MDL",
      mode: "issuance"
    });

    expect(actor.getSnapshot().value).toStrictEqual(
      "TrustFederationVerification"
    );

    jest.advanceTimersByTime(4000);

    expect(navigateToTrustIssuerScreen).toHaveBeenCalledTimes(0);
  });

  it("should call navigateToExtendedLoadingScreen once after 5000ms in TrustFederationVerification state", async () => {
    const actor = createActor(mockedMachine);
    requestCredential.mockImplementation(
      () =>
        new Promise(resolve =>
          setTimeout(
            () =>
              resolve({
                clientId: T_CLIENT_ID,
                codeVerifier: T_CODE_VERIFIER,
                requestedCredential: T_REQUESTED_CREDENTIAL,
                issuerConf: T_ISSUER_CONFIG
              }),
            10
          )
        )
    );
    verifyTrustFederation.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({}), 6000))
    );

    actor.start();

    actor.send({
      type: "select-credential",
      credentialType: "MDL",
      mode: "issuance"
    });

    expect(actor.getSnapshot().value).toStrictEqual(
      "TrustFederationVerification"
    );

    jest.advanceTimersByTime(5000);

    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));
    await waitFor(() =>
      expect(navigateToTrustIssuerScreen).toHaveBeenCalledTimes(1)
    );
  });
});
