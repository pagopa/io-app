import _ from "lodash";
import { StateFrom, createActor } from "xstate";
import { ItwRemoteMachine, itwRemoteMachine } from "../machine.ts";

const T_CLIENT_ID = "clientId";
const T_REQUEST_URI = "https://example.com";
const T_STATE = "state";

type MachineSnapshot = StateFrom<ItwRemoteMachine>;

describe("itwRemoteMachine", () => {
  const navigateToTosScreen = jest.fn();
  const navigateToWallet = jest.fn();
  const navigateToFailureScreen = jest.fn();
  const closeIssuance = jest.fn();

  const isWalletActive = jest.fn();

  const mockedMachine = itwRemoteMachine.provide({
    actions: {
      navigateToTosScreen,
      navigateToWallet,
      navigateToFailureScreen,
      closeIssuance
    },
    actors: {},
    guards: {
      isWalletActive
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
          clientId: T_CLIENT_ID,
          requestUri: T_REQUEST_URI,
          state: T_STATE
        }
      }
    } as MachineSnapshot);

    const actor = createActor(mockedMachine, {
      snapshot
    });
    actor.start();

    actor.send({ type: "go-to-wallet" });
    expect(navigateToWallet).toHaveBeenCalledTimes(1);
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
        }
      }
    } as MachineSnapshot);

    const actor = createActor(mockedMachine, {
      snapshot
    });
    actor.start();

    actor.send({ type: "accept-tos" });
    expect(navigateToTosScreen).toHaveBeenCalledTimes(1);
  });

  it("should transition from Idle to PayloadValidated when ITWallet is active", () => {
    const actor = createActor(mockedMachine);
    actor.start();

    isWalletActive.mockReturnValue(true);

    actor.send({
      type: "start",
      payload: {
        clientId: T_CLIENT_ID,
        requestUri: T_REQUEST_URI,
        state: T_STATE
      }
    });

    expect(actor.getSnapshot().value).toStrictEqual("PayloadValidated");
  });
});
