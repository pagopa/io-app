import _ from "lodash";
import { StateFrom, createActor, fromPromise } from "xstate";
import { ItwRemoteMachine, itwRemoteMachine } from "../machine.ts";
import { ItwRemoteRequestPayload } from "../../utils/itwRemoteTypeUtils.ts";
import {
  EvaluateRelyingPartyTrustInput,
  EvaluateRelyingPartyTrustOutput,
  GetPresentationDetailsInput,
  GetPresentationDetailsOutput
} from "../actors.ts";

const T_CLIENT_ID = "clientId";
const T_REQUEST_URI = "https://example.com";
const T_STATE = "state";

type MachineSnapshot = StateFrom<ItwRemoteMachine>;

describe("itwRemoteMachine", () => {
  const navigateToDiscoveryScreen = jest.fn();
  const navigateToFailureScreen = jest.fn();
  const navigateToClaimsDisclosureScreen = jest.fn();
  const navigateToIdentificationModeScreen = jest.fn();
  const closePresentation = jest.fn();

  const isWalletActive = jest.fn();
  const isEidExpired = jest.fn();

  const evaluateRelyingPartyTrust = jest.fn();
  const getPresentationDetails = jest.fn();

  const mockedMachine = itwRemoteMachine.provide({
    actions: {
      navigateToDiscoveryScreen,
      navigateToFailureScreen,
      navigateToClaimsDisclosureScreen,
      navigateToIdentificationModeScreen,
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
      >(getPresentationDetails)
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
        clientId: T_CLIENT_ID,
        requestUri: T_REQUEST_URI,
        state: T_STATE
      } as ItwRemoteRequestPayload
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
          clientId: T_CLIENT_ID,
          requestUri: T_REQUEST_URI,
          state: T_STATE
        } as ItwRemoteRequestPayload
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
          clientId: T_CLIENT_ID,
          requestUri: T_REQUEST_URI,
          state: T_STATE
        } as ItwRemoteRequestPayload
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
          clientId: T_CLIENT_ID,
          requestUri: T_REQUEST_URI,
          state: T_STATE
        } as ItwRemoteRequestPayload
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
        clientId: T_CLIENT_ID,
        requestUri: T_REQUEST_URI,
        state: T_STATE
      } as ItwRemoteRequestPayload
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
        clientId: T_CLIENT_ID,
        requestUri: T_REQUEST_URI,
        state: T_STATE
      } as ItwRemoteRequestPayload
    });

    expect(navigateToClaimsDisclosureScreen).toHaveBeenCalledTimes(1);
    expect(actor.getSnapshot().value).toStrictEqual(
      "EvaluatingRelyingPartyTrust"
    );
  });
});
