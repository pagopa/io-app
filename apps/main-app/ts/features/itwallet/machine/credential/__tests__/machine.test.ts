import { waitFor } from "@testing-library/react-native";
import _ from "lodash";
import {
  assign,
  createActor,
  fromCallback,
  fromPromise,
  StateFrom,
  waitFor as waitForActor
} from "xstate";
import {
  ItwStatusAssertionMocks,
  ItwStoredCredentialsMocks
} from "../../../common/utils/itwMocksUtils";
import {
  CredentialAccessToken,
  CredentialBundle,
  EvaluatedDcqlQueryResult,
  CredentialMetadata,
  IssuerConfiguration,
  RequestObject
} from "../../../common/utils/itwTypesUtils";
import { ItwTags } from "../../tags";
import {
  GetWalletAttestationActorOutput,
  ObtainAccessTokenActorInput,
  ObtainCredentialActorInput,
  ObtainCredentialActorOutput,
  ObtainStatusAssertionActorInput,
  ProcessCredentialOfferActorInput,
  ProcessCredentialOfferActorOutput,
  RequestCredentialActorInput,
  RequestCredentialActorOutput,
  VerifyTrustFederationActorInput
} from "../actors";
import { Context, InitialContext } from "../context";
import { CredentialIssuanceFailureType } from "../failure";
import {
  ItwCredentialIssuanceMachine,
  itwCredentialIssuanceMachine
} from "../machine";

type MachineSnapshot = StateFrom<ItwCredentialIssuanceMachine>;

const T_WIA: string = "abcdefg";
const T_WUA = { wua1: "wua-jwt" };
const T_CLIENT_ID = "clientId";
const T_CODE_VERIFIER = "codeVerifier";
const T_ISSUER_CONFIG: IssuerConfiguration = {
  federation_entity: {},
  keys: [],
  authorization_endpoint: "",
  pushed_authorization_request_endpoint: "",
  token_endpoint: "",
  credential_issuer: "",
  response_modes_supported: [],
  credential_configurations_supported: {},
  credential_endpoint: "",
  nonce_endpoint: ""
};
const T_REQUESTED_CREDENTIAL: RequestObject = {
  dcql_query: {},
  client_id: T_CLIENT_ID,
  iss: "",
  nonce: "",
  response_mode: "direct_post.jwt",
  response_type: "vp_token",
  response_uri: "",
  state: ""
};
const T_EVALUATED_DCQL_QUERY: EvaluatedDcqlQueryResult = [
  {
    id: "pid",
    format: "dc+sd-jwt",
    keyTag: "pid-key-tag",
    credential: "pid-credential",
    requiredDisclosures: [{ name: "name", value: "John" }],
    presentationFrame: {},
    purposes: [{ required: true }],
    vct: "pid"
  }
];
const T_STORED_STATUS_ASSERTION: CredentialMetadata["storedStatusAssertion"] = {
  credentialStatus: "valid",
  statusAssertion: "abcdefghijklmnopqrstuvwxyz",
  parsedStatusAssertion: ItwStatusAssertionMocks.mdl
};

const T_OFFER_URI =
  "openid-credential-offer://?credential_offer_uri=https://eaa.wallet.ipzs.it/offers/123";
const T_CREDENTIAL_TYPE = "education_degree";
const T_TRUST_ISSUER_BASE_URL = "https://eaa.wallet.ipzs.it";
const T_RESOLVED_CREDENTIAL_OFFER = {
  offer: {
    credential_issuer: T_TRUST_ISSUER_BASE_URL,
    credential_configuration_ids: ["EducationDegreeCredential"],
    grants: {
      authorization_code: {
        scope: T_CREDENTIAL_TYPE,
        authorization_server: T_TRUST_ISSUER_BASE_URL,
        issuer_state: "issuer-state"
      }
    }
  },
  grantDetails: {
    grantType: "authorization_code",
    authorizationCodeGrant: {
      scope: T_CREDENTIAL_TYPE,
      authorizationServer: T_TRUST_ISSUER_BASE_URL,
      issuerState: "issuer-state"
    }
  }
};

describe("itwCredentialIssuanceMachine", () => {
  const onInit = jest.fn();
  const navigateToTrustIssuerScreen = jest.fn();
  const navigateToCredentialPreviewScreen = jest.fn();
  const navigateToFailureScreen = jest.fn();
  const navigateToWallet = jest.fn();
  const navigateToCredentialIntroductionScreen = jest.fn();
  const navigateToEidVerificationExpiredScreen = jest.fn();
  const navigateToCardOnboardingScreen = jest.fn();
  const navigateToCredentialOfferDiscoveryScreen = jest.fn();
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
  const obtainAccessToken = jest.fn();
  const obtainCredential = jest.fn();
  const obtainStatusAssertion = jest.fn();
  const processCredentialOffer = jest.fn();
  const waitForSessionRefresh = jest.fn();

  const isSessionExpired = jest.fn();
  const hasValidWalletInstanceAttestation = jest.fn();
  const isStatusError = jest.fn();
  const isSkipNavigation = jest.fn();
  const isEidExpired = jest.fn();
  const hasCredentialIntroContent = jest.fn();

  const mockedMachine = itwCredentialIssuanceMachine.provide({
    actions: {
      onInit: assign(onInit),
      navigateToTrustIssuerScreen,
      navigateToCredentialPreviewScreen,
      navigateToCredentialIntroductionScreen,
      navigateToFailureScreen,
      navigateToWallet,
      navigateToEidVerificationExpiredScreen,
      navigateToCardOnboardingScreen,
      navigateToCredentialOfferDiscoveryScreen,
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
      verifyTrustFederation: fromPromise<void, VerifyTrustFederationActorInput>(
        verifyTrustFederation
      ),
      getWalletAttestation:
        fromPromise<GetWalletAttestationActorOutput>(getWalletAttestation),
      requestCredential: fromPromise<
        RequestCredentialActorOutput,
        RequestCredentialActorInput
      >(requestCredential),
      obtainAccessToken: fromPromise<
        CredentialAccessToken,
        ObtainAccessTokenActorInput
      >(obtainAccessToken),
      obtainCredential: fromPromise<
        ObtainCredentialActorOutput,
        ObtainCredentialActorInput
      >(obtainCredential),
      obtainStatusAssertion: fromPromise<
        ReadonlyArray<CredentialBundle>,
        ObtainStatusAssertionActorInput
      >(obtainStatusAssertion),
      waitForSessionRefresh: fromCallback(waitForSessionRefresh),
      processCredentialOffer: fromPromise<
        ProcessCredentialOfferActorOutput,
        ProcessCredentialOfferActorInput
      >(processCredentialOffer)
    },
    guards: {
      isSessionExpired,
      hasValidWalletInstanceAttestation,
      isStatusError,
      isEidExpired,
      hasCredentialIntroContent
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
        evaluatedDcqlQuery: T_EVALUATED_DCQL_QUERY,
        issuerConf: T_ISSUER_CONFIG
      })
    );

    /**
     * Start
     */

    const actor = createActor(mockedMachine);
    actor.start();

    expect(actor.getSnapshot().value).toStrictEqual("Idle");
    expect(actor.getSnapshot().context).toStrictEqual(InitialContext);
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));

    actor.send({
      type: "select-credential",
      credentialType: "MDL",
      mode: "issuance"
    });

    await waitFor(() => expect(onInit).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().context).toMatchObject<Partial<Context>>({
      credentialType: "MDL"
    });
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
      evaluatedDcqlQuery: T_EVALUATED_DCQL_QUERY,
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
        credentials: [
          { credential: "", metadata: ItwStoredCredentialsMocks.mdl }
        ],
        walletUnitAttestations: T_WUA
      })
    );

    obtainStatusAssertion.mockImplementation(() =>
      Promise.resolve([
        {
          credential: "",
          metadata: {
            ...ItwStoredCredentialsMocks.mdl,
            storedStatusAssertion: T_STORED_STATUS_ASSERTION
          }
        }
      ])
    );

    actor.send({
      type: "confirm-trust-data"
    });

    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Issuing]));

    // Step 1: get the access token
    const intermediateState1 = await waitForActor(actor, snapshot =>
      snapshot.matches({ Issuance: "ObtainingAccessToken" })
    );
    expect(intermediateState1.value).toStrictEqual({
      Issuance: "ObtainingAccessToken"
    });
    expect(obtainAccessToken).toHaveBeenCalledTimes(1);

    // Step 2: get the credential
    const intermediateState2 = await waitForActor(actor, snapshot =>
      snapshot.matches({ Issuance: "ObtainingCredential" })
    );
    expect(intermediateState2.value).toStrictEqual({
      Issuance: "ObtainingCredential"
    });
    expect(obtainCredential).toHaveBeenCalledTimes(1);

    // Step 3: get the status assertion
    const intermediateState3 = await waitForActor(actor, snapshot =>
      snapshot.matches({ Issuance: "ObtainingStatusAssertion" })
    );
    expect(intermediateState3.value).toStrictEqual({
      Issuance: "ObtainingStatusAssertion"
    });
    expect(obtainStatusAssertion).toHaveBeenCalledTimes(1);

    expect(actor.getSnapshot().value).toStrictEqual(
      "DisplayingCredentialPreview"
    );
    expect(actor.getSnapshot().context).toEqual(
      expect.objectContaining<Partial<Context>>({
        walletUnitAttestations: T_WUA,
        credentials: [
          {
            credential: "",
            metadata: {
              ...ItwStoredCredentialsMocks.mdl,
              storedStatusAssertion: T_STORED_STATUS_ASSERTION
            }
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

    await waitForActor(actor, snap => snap.matches("Completed"));
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
        evaluatedDcqlQuery: T_EVALUATED_DCQL_QUERY,
        issuerConf: T_ISSUER_CONFIG
      })
    );

    /**
     * Start
     */

    const actor = createActor(mockedMachine);
    actor.start();

    expect(actor.getSnapshot().value).toStrictEqual("Idle");
    expect(actor.getSnapshot().context).toStrictEqual<Context>({
      ...InitialContext
    });
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));

    actor.send({
      type: "select-credential",
      credentialType: "MDL",
      mode: "issuance"
    });

    await waitFor(() => expect(onInit).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().context).toMatchObject<Partial<Context>>({
      credentialType: "MDL",
      walletInstanceAttestation: { jwt: T_WIA }
    });
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

    const snapshot = _.merge(undefined, initialSnapshot, {
      value: "DisplayingCredentialPreview",
      context: {
        credentials: [
          { credential: "", metadata: ItwStoredCredentialsMocks.mdl }
        ]
      }
    });

    const actor = createActor(mockedMachine, {
      snapshot
    });
    actor.start();

    expect(actor.getSnapshot().value).toStrictEqual(
      "DisplayingCredentialPreview"
    );
    expect(actor.getSnapshot().context).toMatchObject<Partial<Context>>({
      credentials: [{ credential: "", metadata: ItwStoredCredentialsMocks.mdl }]
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

    await waitFor(() => expect(onInit).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().value).toStrictEqual("RequestingCredential");

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

    const intermediateSnapshot = await waitForActor(actor, s =>
      s.matches({
        Issuance: "ObtainingCredential"
      })
    );
    expect(intermediateSnapshot.tags).toStrictEqual(new Set([ItwTags.Issuing]));
    expect(obtainAccessToken).toHaveBeenCalledTimes(1);
    expect(obtainCredential).toHaveBeenCalledTimes(1);
    expect(obtainStatusAssertion).not.toHaveBeenCalled();

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
                evaluatedDcqlQuery: T_EVALUATED_DCQL_QUERY,
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

    await waitFor(() => expect(onInit).toHaveBeenCalledTimes(1));

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
                evaluatedDcqlQuery: T_EVALUATED_DCQL_QUERY,
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
                evaluatedDcqlQuery: T_EVALUATED_DCQL_QUERY,
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

  it("should navigate to the introduction screen if the catalogue contains the Auth Source user information", async () => {
    isEidExpired.mockImplementation(() => false);
    hasValidWalletInstanceAttestation.mockImplementation(() => true);
    hasCredentialIntroContent.mockImplementation(() => true);

    const actor = createActor(mockedMachine);
    actor.start();

    actor.send({
      type: "select-credential",
      credentialType: "education_degree",
      mode: "issuance"
    });

    await waitForActor(actor, snapshot =>
      snapshot.matches("CredentialIntroduction")
    );
    expect(navigateToCredentialIntroductionScreen).toHaveBeenCalledTimes(1);
  });

  describe("Credential Offer flow", () => {
    it("Should process a credential offer and populate the resolved offer in context", async () => {
      processCredentialOffer.mockImplementation(() =>
        Promise.resolve(T_RESOLVED_CREDENTIAL_OFFER)
      );
      hasValidWalletInstanceAttestation.mockImplementation(() => true);
      hasCredentialIntroContent.mockImplementation(() => false);

      const actor = createActor(mockedMachine);
      actor.start();

      expect(actor.getSnapshot().value).toStrictEqual("Idle");

      actor.send({
        type: "start-credential-offer",
        itwCredentialOfferUri: T_OFFER_URI
      });

      expect(onInit).toHaveBeenCalledTimes(1);
      expect(actor.getSnapshot().context).toMatchObject<Partial<Context>>({
        credentialOfferUri: T_OFFER_URI,
        mode: "issuance"
      });

      await waitFor(() =>
        expect(processCredentialOffer).toHaveBeenCalledTimes(1)
      );

      await waitForActor(actor, snapshot =>
        snapshot.matches("CredentialOfferResolved")
      );

      expect(actor.getSnapshot().context).toMatchObject<Partial<Context>>({
        credentialType: T_CREDENTIAL_TYPE,
        credentialOfferUri: T_OFFER_URI
      });
      expect(actor.getSnapshot().context.resolvedCredentialOffer).toBeDefined();
    });

    it("Should navigate to discovery after resolving a credential offer when the wallet is not valid", async () => {
      onInit.mockImplementation(() => ({
        isWalletValid: false,
        isItWalletValid: false,
        walletInstanceAttestation: undefined
      }));
      processCredentialOffer.mockImplementation(() =>
        Promise.resolve(T_RESOLVED_CREDENTIAL_OFFER)
      );

      const actor = createActor(mockedMachine);
      actor.start();

      actor.send({
        type: "start-credential-offer",
        itwCredentialOfferUri: T_OFFER_URI
      });

      await waitForActor(actor, snapshot =>
        snapshot.matches("CredentialOfferResolved")
      );

      expect(navigateToCredentialOfferDiscoveryScreen).toHaveBeenCalledTimes(1);
    });

    it("Should not navigate to discovery after resolving a credential offer when the wallet is valid", async () => {
      onInit.mockImplementation(() => ({
        isWalletValid: true,
        isItWalletValid: false,
        walletInstanceAttestation: { jwt: T_WIA }
      }));
      processCredentialOffer.mockImplementation(() =>
        Promise.resolve(T_RESOLVED_CREDENTIAL_OFFER)
      );

      const actor = createActor(mockedMachine);
      actor.start();

      actor.send({
        type: "start-credential-offer",
        itwCredentialOfferUri: T_OFFER_URI
      });

      await waitForActor(actor, snapshot =>
        snapshot.matches("CredentialOfferResolved")
      );

      expect(navigateToCredentialOfferDiscoveryScreen).not.toHaveBeenCalled();
    });

    it("Should pass the resolved credential offer to the credential request", async () => {
      processCredentialOffer.mockImplementation(() =>
        Promise.resolve(T_RESOLVED_CREDENTIAL_OFFER)
      );
      hasValidWalletInstanceAttestation.mockImplementation(() => true);
      hasCredentialIntroContent.mockImplementation(() => true);
      verifyTrustFederation.mockImplementation(() => Promise.resolve());
      requestCredential.mockImplementation(() =>
        Promise.resolve({
          clientId: T_CLIENT_ID,
          codeVerifier: T_CODE_VERIFIER,
          requestedCredential: T_REQUESTED_CREDENTIAL,
          issuerConf: T_ISSUER_CONFIG
        })
      );

      const actor = createActor(mockedMachine);
      actor.start();

      actor.send({
        type: "start-credential-offer",
        itwCredentialOfferUri: T_OFFER_URI
      });

      await waitForActor(actor, snapshot =>
        snapshot.matches("CredentialOfferResolved")
      );

      actor.send({ type: "confirm-credential-offer" });

      await waitFor(() => expect(requestCredential).toHaveBeenCalledTimes(1));
      expect(requestCredential).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            credentialType: T_CREDENTIAL_TYPE,
            resolvedCredentialOffer: T_RESOLVED_CREDENTIAL_OFFER
          })
        })
      );
      expect(navigateToCredentialIntroductionScreen).not.toHaveBeenCalled();
    });

    it("Should resume the resolved credential offer after eID activation", async () => {
      onInit
        .mockImplementationOnce(() => ({
          isWalletValid: false,
          isItWalletValid: false,
          walletInstanceAttestation: undefined
        }))
        .mockImplementationOnce(() => ({
          isWalletValid: true,
          isItWalletValid: true,
          walletInstanceAttestation: { jwt: T_WIA }
        }));
      processCredentialOffer.mockImplementation(() =>
        Promise.resolve(T_RESOLVED_CREDENTIAL_OFFER)
      );
      hasValidWalletInstanceAttestation.mockImplementation(() => true);
      hasCredentialIntroContent.mockImplementation(() => true);
      verifyTrustFederation.mockImplementation(() => Promise.resolve());
      requestCredential.mockImplementation(() =>
        Promise.resolve({
          clientId: T_CLIENT_ID,
          codeVerifier: T_CODE_VERIFIER,
          requestedCredential: T_REQUESTED_CREDENTIAL,
          issuerConf: T_ISSUER_CONFIG
        })
      );

      const actor = createActor(mockedMachine);
      actor.start();

      actor.send({
        type: "start-credential-offer",
        itwCredentialOfferUri: T_OFFER_URI
      });

      await waitForActor(actor, snapshot =>
        snapshot.matches("CredentialOfferResolved")
      );

      actor.send({ type: "confirm-credential-offer" });

      await waitFor(() => expect(requestCredential).toHaveBeenCalledTimes(1));
      expect(onInit).toHaveBeenCalledTimes(2);
      expect(requestCredential).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            credentialType: T_CREDENTIAL_TYPE,
            walletInstanceAttestation: T_WIA,
            resolvedCredentialOffer: T_RESOLVED_CREDENTIAL_OFFER,
            skipMdocIssuance: false
          })
        })
      );
      expect(navigateToCredentialIntroductionScreen).not.toHaveBeenCalled();
    });

    it("Should keep the resolved credential offer when eID renewal is needed", async () => {
      processCredentialOffer.mockImplementation(() =>
        Promise.resolve(T_RESOLVED_CREDENTIAL_OFFER)
      );
      isEidExpired.mockImplementation(() => true);

      const actor = createActor(mockedMachine);
      actor.start();

      actor.send({
        type: "start-credential-offer",
        itwCredentialOfferUri: T_OFFER_URI
      });

      await waitForActor(actor, snapshot =>
        snapshot.matches("CredentialOfferResolved")
      );

      actor.send({ type: "confirm-credential-offer" });

      await waitFor(() =>
        expect(navigateToEidVerificationExpiredScreen).toHaveBeenCalledTimes(1)
      );
      expect(actor.getSnapshot().context.resolvedCredentialOffer).toStrictEqual(
        T_RESOLVED_CREDENTIAL_OFFER
      );
    });
  });

  it("Should wait for session refresh then retry the credential request", async () => {
    isSessionExpired.mockImplementationOnce(() => true);
    obtainCredential.mockImplementationOnce(() => Promise.reject({}));
    obtainCredential.mockImplementationOnce(() =>
      Promise.resolve({
        credentials: [
          { credential: "", metadata: ItwStoredCredentialsMocks.mdl }
        ],
        walletUnitAttestations: T_WUA
      })
    );

    const initialSnapshot = createActor(
      itwCredentialIssuanceMachine
    ).getSnapshot();

    const snapshot: MachineSnapshot = _.merge(initialSnapshot, {
      value: "DisplayingTrustIssuer"
    } as MachineSnapshot);

    const actor = createActor(mockedMachine, { snapshot });
    actor.start();

    actor.send({ type: "confirm-trust-data" });

    const intermediateSnapshot1 = await waitForActor(actor, s =>
      s.matches({
        Issuance: "WaitingForSessionRefresh"
      })
    );

    expect(intermediateSnapshot1.value).toEqual({
      Issuance: "WaitingForSessionRefresh"
    });
    expect(handleSessionExpired).toHaveBeenCalledTimes(1);

    actor.send({ type: "session-refresh-complete" });

    const intermediateSnapshot2 = await waitForActor(actor, s =>
      s.matches({
        Issuance: "ObtainingStatusAssertion"
      })
    );
    expect(intermediateSnapshot2.value).toEqual({
      Issuance: "ObtainingStatusAssertion"
    });
    expect(intermediateSnapshot2.context).toMatchObject<Partial<Context>>({
      credentials: [
        { credential: "", metadata: ItwStoredCredentialsMocks.mdl }
      ],
      walletUnitAttestations: T_WUA
    });
  });
});
