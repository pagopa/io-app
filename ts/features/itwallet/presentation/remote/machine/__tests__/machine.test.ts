import _ from "lodash";
import { StateFrom, createActor } from "xstate";
import { ItwRemoteMachine, itwRemoteMachine } from "../machine.ts";

const T_CLIENT_ID = "clientId";
const T_REQUEST_URI = "https://example.com";
const T_STATE = "state";

type MachineSnapshot = StateFrom<ItwRemoteMachine>;

describe("itwRemoteMachine", () => {
  const navigateToItwWalletInactiveScreen = jest.fn();
  const navigateToTosScreen = jest.fn();
  const navigateToWallet = jest.fn();
  const closeIssuance = jest.fn();

  const isItwWalletInactive = jest.fn();

  const mockedMachine = itwRemoteMachine.provide({
    actions: {
      navigateToItwWalletInactiveScreen,
      navigateToTosScreen,
      navigateToWallet,
      closeIssuance
    },
    actors: {},
    guards: {
      isItwWalletInactive
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
    isItwWalletInactive.mockReturnValue(true);

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

    expect(actor.getSnapshot().value).toStrictEqual("WalletInactive");
    expect(navigateToItwWalletInactiveScreen).toHaveBeenCalledTimes(1);
  });

  it("Should navigate to wallet when user not accept to active ITWallet", async () => {
    const initialSnapshot: MachineSnapshot =
      createActor(itwRemoteMachine).getSnapshot();

    const snapshot: MachineSnapshot = _.merge(undefined, initialSnapshot, {
      value: "WalletInactive",
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
      value: "WalletInactive",
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

    isItwWalletInactive.mockReturnValue(false);

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
