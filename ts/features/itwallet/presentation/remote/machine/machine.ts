import { assign, setup } from "xstate";
import { ItwTags } from "../../../machine/tags";
import { InitialContext, Context } from "./context";
import { mapEventToFailure } from "./failure";
import { RemoteEvents } from "./events";

const notImplemented = () => {
  throw new Error("Not implemented");
};

export const itwRemoteMachine = setup({
  types: {
    context: {} as Context,
    events: {} as RemoteEvents
  },
  actions: {
    setFailure: assign(({ event }) => ({ failure: mapEventToFailure(event) })),
    navigateToItwWalletInactiveScreen: notImplemented,
    navigateToTosScreen: notImplemented,
    navigateToWallet: notImplemented,
    closeIssuance: notImplemented
  },
  actors: {},
  guards: {
    isItwWalletInactive: notImplemented
  }
}).createMachine({
  id: "itwRemoteMachine",
  context: { ...InitialContext },
  initial: "Idle",
  states: {
    Idle: {
      description:
        "The machine is in idle, ready to start the remote presentation flow",
      on: {
        start: {
          actions: assign(({ event }) => ({
            payload: event.payload
          })),
          target: "PayloadValidation"
        }
      }
    },
    PayloadValidation: {
      description: "Validating the remote request payload before proceeding",
      tags: [ItwTags.Loading],
      always: [
        {
          guard: "isItwWalletInactive",
          target: "WalletInactive"
        },
        {
          target: "PayloadValidated"
        }
      ]
    },
    WalletInactive: {
      entry: "navigateToItwWalletInactiveScreen",
      description: "The wallet is inactive, showing the inactive screen",
      on: {
        "accept-tos": {
          actions: "navigateToTosScreen"
        },
        "go-to-wallet": {
          actions: "navigateToWallet"
        }
      }
    },
    PayloadValidated: {
      description: "The remote request payload has been validated",
      on: {
        close: {
          actions: "closeIssuance"
        }
      }
    },
    Failure: {
      description: "This state is reached when an error occurs"
    }
  }
});

export type ItwRemoteMachine = typeof itwRemoteMachine;
