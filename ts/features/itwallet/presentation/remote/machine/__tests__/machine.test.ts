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
  SendAuthorizationResponseInput,
  SendAuthorizationResponseOutput
} from "../actors.ts";
import { Context, InitialContext } from "../context.ts";
import { RequestObject } from "../../../../common/utils/itwTypesUtils.ts";

const T_CLIENT_ID = "clientId";
const T_REQUEST_URI = "https://example.com";
const T_STATE = "state";
const T_REDIRECT_URI = "https://example.com/redirect";

type MachineSnapshot = StateFrom<ItwRemoteMachine>;

describe("itwRemoteMachine", () => {
  const navigateToDiscoveryScreen = jest.fn();
  const navigateToFailureScreen = jest.fn();
  const navigateToClaimsDisclosureScreen = jest.fn();
  const navigateToIdentificationModeScreen = jest.fn();
  const navigateToAuthResponseScreen = jest.fn();
  const closePresentation = jest.fn();

  const isWalletActive = jest.fn();
  const isEidExpired = jest.fn();

  const evaluateRelyingPartyTrust = jest.fn();
  const getPresentationDetails = jest.fn();
  const sendAuthorizationResponse = jest.fn();

  const mockedMachine = itwRemoteMachine.provide({
    actions: {
      navigateToDiscoveryScreen,
      navigateToFailureScreen,
      navigateToClaimsDisclosureScreen,
      navigateToIdentificationModeScreen,
      navigateToAuthResponseScreen,
      closePresentation
    },
    actors: {
      evaluateRelyingPartyTrust: fromPromise<
        EvaluateRelyingPartyTrustOutput,
        EvaluateRelyingPartyTrustInput
      >(evaluateRelyingPartyTrust),
      getPresentationDetails: fromPromise<
        GetPresentationDetailsOutput,
        GetPresentationDetailsInput
      >(getPresentationDetails),
      sendAuthorizationResponse: fromPromise<
        SendAuthorizationResponseOutput,
        SendAuthorizationResponseInput
      >(sendAuthorizationResponse)
    },
    guards: {
      isWalletActive,
      isEidExpired
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

  it("should transition from Idle to WalletInactive when wallet is inactive", () => {
    isWalletActive.mockReturnValue(false);

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

    expect(actor.getSnapshot().value).toStrictEqual("Failure");
    expect(navigateToFailureScreen).toHaveBeenCalledTimes(1);
  });

  it("Should navigate to wallet when user not accept to active ITWallet", async () => {
    const initialSnapshot: MachineSnapshot =
      createActor(itwRemoteMachine).getSnapshot();

    const snapshot: MachineSnapshot = _.merge(undefined, initialSnapshot, {
      value: "Failure",
      context: {
        payload: {
          client_id: T_CLIENT_ID,
          request_uri: T_REQUEST_URI,
          state: T_STATE
        }
      }
    } as MachineSnapshot);

    const actor = createActor(mockedMachine, {
      snapshot
    });
    actor.start();

    actor.send({ type: "close" });
    expect(closePresentation).toHaveBeenCalledTimes(1);
  });

  it("Should navigate to TOS when user accept to active ITWallet", async () => {
    const initialSnapshot: MachineSnapshot =
      createActor(itwRemoteMachine).getSnapshot();

    const snapshot: MachineSnapshot = _.merge(undefined, initialSnapshot, {
      value: "Failure",
      context: {
        payload: {
          client_id: T_CLIENT_ID,
          request_uri: T_REQUEST_URI,
          state: T_STATE
        }
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
        payload: {
          client_id: T_CLIENT_ID,
          request_uri: T_REQUEST_URI,
          state: T_STATE,
          request_uri_method: "get"
        }
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
    isWalletActive.mockReturnValue(true);
    isEidExpired.mockReturnValue(true);

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

    expect(actor.getSnapshot().value).toStrictEqual("Failure");
    expect(navigateToFailureScreen).toHaveBeenCalledTimes(1);
  });

  it("should transition from Idle to EvaluatingRelyingPartyTrust when ITWallet is active", () => {
    const actor = createActor(mockedMachine);
    actor.start();

    isWalletActive.mockReturnValue(true);
    isEidExpired.mockReturnValue(false);

    actor.send({
      type: "start",
      payload: {
        client_id: T_CLIENT_ID,
        request_uri: T_REQUEST_URI,
        state: T_STATE,
        request_uri_method: "get"
      }
    });

    expect(actor.getSnapshot().value).toStrictEqual(
      "EvaluatingRelyingPartyTrust"
    );
  });

  it("should complete the presentation without errors", async () => {
    /**
     * Mocks
     */
    const qrCodePayload: ItwRemoteRequestPayload = {
      client_id: T_CLIENT_ID,
      request_uri: T_REQUEST_URI,
      state: T_STATE,
      request_uri_method: "get"
    };
    const rpConf = {} as RelyingPartyConfiguration;
    const presentationDetails = [] as EnrichedPresentationDetails;
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

    isWalletActive.mockReturnValue(true);
    isEidExpired.mockReturnValue(false);
    evaluateRelyingPartyTrust.mockResolvedValue({
      rpConf,
      rpSubject: T_CLIENT_ID
    });
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
     * Get the presentation details from the RP
     */
    await waitFor(actor, snapshot =>
      snapshot.matches("GettingPresentationDetails")
    );
    expect(getPresentationDetails).toHaveBeenCalledTimes(1);
    expect(actor.getSnapshot().context).toStrictEqual<Context>({
      ...InitialContext,
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
    isWalletActive.mockReturnValue(true);
    isEidExpired.mockReturnValue(false);
    evaluateRelyingPartyTrust.mockResolvedValue({});
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
    isWalletActive.mockReturnValue(true);
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
});
