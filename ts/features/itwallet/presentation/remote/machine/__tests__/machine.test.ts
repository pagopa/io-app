import _ from "lodash";
import { StateFrom, createActor, fromPromise, waitFor } from "xstate";
import { ItwRemoteMachine, itwRemoteMachine } from "../machine.ts";
import {
  EnrichedPresentationDetails,
  ItwRemoteRequestPayload,
  RelyingPartyConfiguration
} from "../../utils/itwRemoteTypeUtils.ts";
import {
  EvaluateRelyingPartyTrustInput,
  EvaluateRelyingPartyTrustOutput,
  GetPresentationDetailsInput,
  GetPresentationDetailsOutput,
  GetRequestObjectInput,
  GetRequestObjectOutput,
  SendAuthorizationResponseInput,
  SendAuthorizationResponseOutput
} from "../actors.ts";
import { Context, InitialContext } from "../context.ts";
import {
  RequestObject,
  WalletInstanceAttestations
} from "../../../../common/utils/itwTypesUtils.ts";
import { RemoteFailureType } from "../failure.ts";

const T_CLIENT_ID = "clientId";
const T_REQUEST_URI = "https://example.com";
const T_STATE = "state";
const T_REDIRECT_URI = "https://example.com/redirect";

const qrCodePayload: ItwRemoteRequestPayload = {
  client_id: T_CLIENT_ID,
  request_uri: T_REQUEST_URI,
  state: T_STATE,
  request_uri_method: "get"
};

type MachineSnapshot = StateFrom<ItwRemoteMachine>;

describe("itwRemoteMachine", () => {
  const navigateToDiscoveryScreen = jest.fn();
  const navigateToFailureScreen = jest.fn();
  const navigateToClaimsDisclosureScreen = jest.fn();
  const navigateToIdentificationModeScreen = jest.fn();
  const navigateToAuthResponseScreen = jest.fn();
  const closePresentation = jest.fn();
  const trackRemoteDataShare = jest.fn();
  const storeWalletInstanceAttestation = jest.fn();

  const isItWalletL3Active = jest.fn();
  const isEidExpired = jest.fn();
  const hasValidWalletInstanceAttestation = jest.fn().mockReturnValue(true);

  const evaluateRelyingPartyTrust = jest.fn();
  const getRequestObject = jest.fn();
  const getPresentationDetails = jest.fn();
  const sendAuthorizationResponse = jest.fn();
  const getWalletAttestation = jest.fn();

  const mockedMachine = itwRemoteMachine.provide({
    actions: {
      navigateToDiscoveryScreen,
      navigateToFailureScreen,
      navigateToClaimsDisclosureScreen,
      navigateToIdentificationModeScreen,
      navigateToAuthResponseScreen,
      closePresentation,
      trackRemoteDataShare,
      storeWalletInstanceAttestation
    },
    actors: {
      evaluateRelyingPartyTrust: fromPromise<
        EvaluateRelyingPartyTrustOutput,
        EvaluateRelyingPartyTrustInput
      >(evaluateRelyingPartyTrust),
      getRequestObject: fromPromise<
        GetRequestObjectOutput,
        GetRequestObjectInput
      >(getRequestObject),
      getPresentationDetails: fromPromise<
        GetPresentationDetailsOutput,
        GetPresentationDetailsInput
      >(getPresentationDetails),
      sendAuthorizationResponse: fromPromise<
        SendAuthorizationResponseOutput,
        SendAuthorizationResponseInput
      >(sendAuthorizationResponse),
      getWalletAttestation:
        fromPromise<WalletInstanceAttestations>(getWalletAttestation)
    },
    guards: {
      isItWalletL3Active,
      isEidExpired,
      hasValidWalletInstanceAttestation
    }
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize correctly", () => {
    const actor = createActor(mockedMachine);
    actor.start();

    expect(actor.getSnapshot().value).toStrictEqual("Idle");
  });

  it("should transition from Idle to WalletInactive when wallet is inactive or the identification is not L3", () => {
    isItWalletL3Active.mockReturnValue(false);

    const actor = createActor(mockedMachine);
    actor.start();

    actor.send({
      type: "start",
      payload: qrCodePayload
    });

    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toStrictEqual("Failure");
    expect(snapshot.context.failure?.type).toEqual(
      RemoteFailureType.WALLET_INACTIVE
    );
    expect(navigateToFailureScreen).toHaveBeenCalledTimes(1);
  });

  it("Should navigate to wallet when user not accept to active IT Wallet", async () => {
    const initialSnapshot: MachineSnapshot =
      createActor(itwRemoteMachine).getSnapshot();

    const snapshot: MachineSnapshot = _.merge(undefined, initialSnapshot, {
      value: "Failure",
      context: {
        payload: qrCodePayload
      }
    } as MachineSnapshot);

    const actor = createActor(mockedMachine, {
      snapshot
    });
    actor.start();

    actor.send({ type: "close" });
    expect(closePresentation).toHaveBeenCalledTimes(1);
  });

  it("Should navigate to TOS when user accept to active IT Wallet", async () => {
    const initialSnapshot: MachineSnapshot =
      createActor(itwRemoteMachine).getSnapshot();

    const snapshot: MachineSnapshot = _.merge(undefined, initialSnapshot, {
      value: "Failure",
      context: {
        payload: qrCodePayload
      }
    } as MachineSnapshot);

    const actor = createActor(mockedMachine, {
      snapshot
    });
    actor.start();

    actor.send({ type: "go-to-wallet-activation" });
    expect(navigateToDiscoveryScreen).toHaveBeenCalledTimes(1);
  });

  it("Should navigate to Identification mode when user start the reissuing flow", async () => {
    const initialSnapshot: MachineSnapshot =
      createActor(itwRemoteMachine).getSnapshot();

    const snapshot: MachineSnapshot = _.merge(undefined, initialSnapshot, {
      value: "Failure",
      context: {
        payload: qrCodePayload
      }
    } as MachineSnapshot);

    const actor = createActor(mockedMachine, {
      snapshot
    });
    actor.start();

    actor.send({ type: "go-to-identification-mode" });
    expect(navigateToIdentificationModeScreen).toHaveBeenCalledTimes(1);
  });

  it("should transition from Idle to Failure when EID is expired", () => {
    isItWalletL3Active.mockReturnValue(true);
    isEidExpired.mockReturnValue(true);

    const actor = createActor(mockedMachine);
    actor.start();

    actor.send({
      type: "start",
      payload: qrCodePayload
    });

    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toStrictEqual("Failure");
    expect(snapshot.context.failure?.type).toEqual(
      RemoteFailureType.EID_EXPIRED
    );
    expect(navigateToFailureScreen).toHaveBeenCalledTimes(1);
  });

  it("should transition from Idle to EvaluatingRelyingPartyTrust when IT Wallet is active", () => {
    const actor = createActor(mockedMachine);
    actor.start();

    isItWalletL3Active.mockReturnValue(true);
    isEidExpired.mockReturnValue(false);

    actor.send({
      type: "start",
      payload: qrCodePayload
    });

    expect(actor.getSnapshot().value).toStrictEqual(
      "EvaluatingRelyingPartyTrust"
    );
  });

  it("should complete the presentation without errors", async () => {
    /**
     * Mocks
     */
    const rpConf = {} as RelyingPartyConfiguration;
    const presentationDetails = [] as EnrichedPresentationDetails;
    const unverifiedRequestObject = "";
    const requestObject = {
      ...({} as RequestObject),
      client_id: T_CLIENT_ID,
      dcql_query: {
        credentials: [
          {
            id: "PID",
            format: "vc+sd-jwt",
            meta: { vct_values: ["PersonIdentificationData"] }
          }
        ]
      }
    };

    isItWalletL3Active.mockReturnValue(true);
    isEidExpired.mockReturnValue(false);
    evaluateRelyingPartyTrust.mockResolvedValue({
      rpConf,
      rpSubject: T_CLIENT_ID
    });
    getRequestObject.mockResolvedValue(unverifiedRequestObject);
    getPresentationDetails.mockResolvedValue({
      requestObject,
      presentationDetails
    });
    sendAuthorizationResponse.mockResolvedValue({
      redirectUri: T_REDIRECT_URI
    });

    /**
     * Start the presentation
     */
    const actor = createActor(mockedMachine);
    actor.start();

    actor.send({ type: "start", payload: qrCodePayload });
    expect(actor.getSnapshot().context).toStrictEqual<Context>({
      ...InitialContext,
      payload: qrCodePayload
    });

    /**
     * Ensure the Wallet Attestation is not requested again if valid
     */
    expect(hasValidWalletInstanceAttestation).toHaveBeenCalledTimes(1);
    expect(getWalletAttestation).not.toHaveBeenCalled();

    /**
     * Evaluate the Relying Party Trust
     */
    await waitFor(actor, snapshot =>
      snapshot.matches("EvaluatingRelyingPartyTrust")
    );
    expect(evaluateRelyingPartyTrust).toHaveBeenCalledTimes(1);
    expect(actor.getSnapshot().context).toStrictEqual<Context>({
      ...InitialContext,
      payload: qrCodePayload,
      rpConf,
      rpSubject: T_CLIENT_ID
    });

    /**
     * Get the RequestObject from the RP
     */
    await waitFor(actor, snapshot => snapshot.matches("GettingRequestObject"));
    expect(getRequestObject).toHaveBeenCalledTimes(1);
    expect(actor.getSnapshot().context).toStrictEqual<Context>({
      ...InitialContext,
      requestObjectEncodedJwt: unverifiedRequestObject,
      payload: qrCodePayload,
      rpConf,
      rpSubject: T_CLIENT_ID
    });

    /**
     * Get the presentation details from the RP
     */
    await waitFor(actor, snapshot =>
      snapshot.matches("GettingPresentationDetails")
    );
    expect(getPresentationDetails).toHaveBeenCalledTimes(1);
    expect(actor.getSnapshot().context).toStrictEqual<Context>({
      ...InitialContext,
      requestObjectEncodedJwt: unverifiedRequestObject,
      payload: qrCodePayload,
      rpConf,
      rpSubject: T_CLIENT_ID,
      requestObject,
      presentationDetails
    });

    /**
     * The user selects optional credentials and gives consent to share the credentials with the RP
     */
    await waitFor(actor, snapshot => snapshot.matches("ClaimsDisclosure"));
    expect(navigateToClaimsDisclosureScreen).toHaveBeenCalledTimes(1);
    actor.send({
      type: "toggle-credential",
      credentialIds: ["cred01", "cred02", "cred03"]
    });
    // Test the toggle logic, cred03 should not be present
    actor.send({ type: "toggle-credential", credentialIds: ["cred03"] });
    expect(actor.getSnapshot().context).toStrictEqual<Context>({
      ...InitialContext,
      requestObjectEncodedJwt: unverifiedRequestObject,
      payload: qrCodePayload,
      rpConf,
      rpSubject: T_CLIENT_ID,
      requestObject,
      presentationDetails,
      selectedOptionalCredentials: new Set(["cred01", "cred02"])
    });
    actor.send({ type: "holder-consent" });

    /**
     * The Wallet sends the Authorization Response to the RP
     */
    await waitFor(actor, snapshot =>
      snapshot.matches("SendingAuthorizationResponse")
    );
    expect(navigateToAuthResponseScreen).toHaveBeenCalledTimes(1);
    expect(sendAuthorizationResponse).toHaveBeenCalledTimes(1);
    expect(actor.getSnapshot().context).toStrictEqual<Context>({
      ...InitialContext,
      requestObjectEncodedJwt: unverifiedRequestObject,
      payload: qrCodePayload,
      rpConf,
      rpSubject: T_CLIENT_ID,
      requestObject,
      presentationDetails,
      selectedOptionalCredentials: new Set(["cred01", "cred02"]),
      redirectUri: T_REDIRECT_URI
    });

    await waitFor(actor, snapshot => snapshot.matches("Success"));

    /**
     * The user closes the presentation flow
     */
    actor.send({ type: "close" });
    expect(closePresentation).toHaveBeenCalledTimes(1);
  });

  it("should transition to failure when an error occurs in GettingPresentationDetails", async () => {
    isItWalletL3Active.mockReturnValue(true);
    isEidExpired.mockReturnValue(false);
    evaluateRelyingPartyTrust.mockResolvedValue({});
    getRequestObject.mockReturnValue("");
    getPresentationDetails.mockRejectedValue({ message: "ERROR" });

    const actor = createActor(mockedMachine);
    actor.start();

    actor.send({
      type: "start",
      payload: {
        client_id: T_CLIENT_ID,
        request_uri: T_REQUEST_URI,
        state: T_STATE,
        request_uri_method: "get"
      }
    });

    await waitFor(actor, snapshot =>
      snapshot.matches("GettingPresentationDetails")
    );

    expect(getPresentationDetails).toHaveBeenCalledTimes(1);
    await waitFor(actor, snapshot => snapshot.matches("Failure"));
  });

  it("should transition to failure when an error occurs in SendingAuthorizationResponse", async () => {
    sendAuthorizationResponse.mockRejectedValue({ message: "ERROR" });

    const initialSnapshot = createActor(itwRemoteMachine).getSnapshot();
    const actor = createActor(mockedMachine, {
      snapshot: _.merge(undefined, initialSnapshot, {
        // Start in the previous state to invoke the actor when transitioning to SendingAuthorizationResponse
        value: "ClaimsDisclosure"
      })
    });
    actor.start();

    actor.send({ type: "holder-consent" });
    await waitFor(actor, snapshot =>
      snapshot.matches("SendingAuthorizationResponse")
    );

    expect(sendAuthorizationResponse).toHaveBeenCalledTimes(1);
    await waitFor(actor, snapshot => snapshot.matches("Failure"));
  });

  it("should transition to Failure when an error occurs in EvaluatingRelyingPartyTrust", async () => {
    isItWalletL3Active.mockReturnValue(true);
    isEidExpired.mockReturnValue(false);

    evaluateRelyingPartyTrust.mockImplementation(() => {
      throw new Error("Trust evaluation failed");
    });

    const actor = createActor(mockedMachine);
    actor.start();

    actor.send({
      type: "start",
      payload: {
        client_id: T_CLIENT_ID,
        request_uri: T_REQUEST_URI,
        state: T_STATE
      } as ItwRemoteRequestPayload
    });

    expect(actor.getSnapshot().value).toStrictEqual("Failure");
    expect(navigateToFailureScreen).toHaveBeenCalledTimes(1);
  });

  it("should reset the machine", async () => {
    const initialSnapshot = createActor(itwRemoteMachine).getSnapshot();
    const actor = createActor(mockedMachine, {
      snapshot: _.merge(undefined, initialSnapshot, {
        value: "ClaimsDisclosure",
        context: {
          ...InitialContext,
          payload: qrCodePayload,
          rpSubject: "test_rp"
        }
      })
    });
    actor.start();
    actor.send({ type: "reset" });

    await waitFor(actor, snapshot => snapshot.matches("Idle"));
    expect(actor.getSnapshot().context).toStrictEqual<Context>(InitialContext);
  });

  it("should fetch the Wallet Attestation when it is invalid", async () => {
    const mockWalletAttestation = {
      jwt: "wallet-attestation-jwt",
      "dc+sd-jwt": "wallet-attestation-sdjwt"
    };

    isItWalletL3Active.mockReturnValue(true);
    isEidExpired.mockReturnValue(false);
    hasValidWalletInstanceAttestation.mockReturnValueOnce(false);
    getWalletAttestation.mockResolvedValue(mockWalletAttestation);

    const actor = createActor(mockedMachine);
    actor.start();

    actor.send({ type: "start", payload: qrCodePayload });

    await waitFor(actor, snapshot =>
      snapshot.matches("ObtainingWalletInstanceAttestation")
    );
    expect(getWalletAttestation).toHaveBeenCalledTimes(1);
    expect(storeWalletInstanceAttestation).toHaveBeenCalledTimes(1);
    expect(
      storeWalletInstanceAttestation.mock.lastCall.at(0).event.output
    ).toEqual(mockWalletAttestation);
  });
});
