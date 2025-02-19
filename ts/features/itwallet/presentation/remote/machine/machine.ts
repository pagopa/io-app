import { assign, not, setup } from "xstate";
import { InitialContext, Context } from "./context";
import { mapEventToFailure, RemoteFailureType } from "./failure";
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
    navigateToFailureScreen: notImplemented,
    navigateToDiscoveryScreen: notImplemented,
    navigateToWallet: notImplemented,
    navigateToClaimsDisclosureScreen: notImplemented,
    navigateToIdentificationModeScreen: notImplemented,
    close: notImplemented
  },
  actors: {},
  guards: {
    isWalletActive: notImplemented,
    areRequiredCredentialsAvailable: notImplemented,
    isEidExpired: notImplemented
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
          target: "PreliminaryChecks"
        }
      }
    },
    PreliminaryChecks: {
      description:
        "Perform preliminary checks on the wallet and necessary conditions before proceeding",
      always: [
        {
          guard: not("isWalletActive"),
          actions: assign({
            failure: {
              type: RemoteFailureType.WALLET_INACTIVE,
              reason: "IT Wallet is inactive"
            }
          }),
          target: "Failure"
        },
        {
          guard: "isEidExpired",
          actions: assign({
            failure: {
              type: RemoteFailureType.EID_EXPIRED,
              reason: "EID is expired"
            }
          }),
          target: "Failure"
        },
        {
          target: "ClaimsDisclosure"
        }
      ]
    },
    ClaimsDisclosure: {
      entry: "navigateToClaimsDisclosureScreen",
      description:
        "Display the list of claims to disclose for the verifiable presentation",
      on: {
        close: {
          actions: "close"
        }
      }
    },
    Failure: {
      entry: "navigateToFailureScreen",
      description: "This state is reached when an error occurs",
      on: {
        "go-to-wallet-activation": {
          actions: "navigateToDiscoveryScreen"
        },
        "go-to-identification-mode": {
          actions: "navigateToIdentificationModeScreen"
        },
        close: {
          actions: "close"
        }
      }
    }
  }
});

export type ItwRemoteMachine = typeof itwRemoteMachine;
