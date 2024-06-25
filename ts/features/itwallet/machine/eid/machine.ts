import { assign, forwardTo, fromPromise, setup } from "xstate5";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { Events as IdentificationEvents } from "../identification/events";
import { itwIdentificationMachine } from "../identification/machine";
import { ItwTags } from "../tags";
import { Context, InitialContext } from "./context";
import { EidIssuanceEvents } from "./events";

const notImplemented = () => {
  throw new Error("Not implemented");
};

export const itwEidIssuanceMachine = setup({
  types: {
    children: {} as {
      identificationMachine: "identificationMachine";
    },
    context: {} as Context,
    events: {} as EidIssuanceEvents | IdentificationEvents
  },
  actions: {
    navigateToTosScreen: notImplemented,
    navigateToEidPreviewScreen: notImplemented,
    navigateToSuccessScreen: notImplemented,
    navigateToFailureScreen: notImplemented,
    navigateToWallet: notImplemented,
    navigateToCredentialCatalog: notImplemented,
    storeWalletAttestation: notImplemented,
    storeEidCredential: notImplemented,
    closeIssuance: notImplemented,
    requestAssistance: notImplemented
  },
  actors: {
    registerWalletInstance: fromPromise<string>(notImplemented),
    requestEid: fromPromise<StoredCredential, string | undefined>(
      notImplemented
    ),
    identificationMachine: itwIdentificationMachine
  }
}).createMachine({
  id: "itwEidIssuanceMachine",
  context: InitialContext,
  initial: "Idle",
  states: {
    Idle: {
      on: {
        start: {
          target: "TosAcceptance"
        }
      }
    },
    TosAcceptance: {
      entry: "navigateToTosScreen",
      on: {
        "accept-tos": {
          target: "WalletInitialization"
        }
      }
    },
    WalletInitialization: {
      tags: [ItwTags.Loading],
      description: "Wallet instance registration and attestation issuance",
      invoke: {
        src: "registerWalletInstance",
        onDone: {
          target: "Identification",
          actions: "storeWalletAttestation"
        },
        onError: {
          target: "Failure"
        }
      }
    },
    Identification: {
      description:
        "User identification flow. Once we get the user token we can continue to the eid issuance",
      invoke: {
        id: "identificationMachine",
        src: "identificationMachine",
        systemId: "identificationMachine",
        onDone: {
          actions: assign(({ event }) => ({
            userToken: event.output.token
          })),
          target: "#itwEidIssuanceMachine.Issuance"
        },
        onError: {
          target: "#itwEidIssuanceMachine.Failure"
        }
      },
      on: {
        back: {
          target: "TosAcceptance"
        },
        // Every "identification" event is forwared to the identiciation machine
        "identification.*": {
          actions: forwardTo("identificationMachine")
        }
      }
    },
    Issuance: {
      entry: "navigateToEidPreviewScreen",
      initial: "RequestingEid",
      states: {
        RequestingEid: {
          tags: [ItwTags.Loading],
          invoke: {
            src: "requestEid",
            input: ({ context }) => context.userToken,
            onDone: {
              actions: assign(({ event }) => ({ eid: event.output })),
              target: "#itwEidIssuanceMachine.Issuance.DisplayingPreview"
            },
            onError: {
              target: "#itwEidIssuanceMachine.Failure"
            }
          }
        },
        DisplayingPreview: {
          on: {
            "add-to-wallet": {
              actions: "storeEidCredential",
              target: "#itwEidIssuanceMachine.Success"
            },
            close: {
              actions: "closeIssuance"
            }
          }
        }
      }
    },
    Success: {
      entry: "navigateToSuccessScreen",
      on: {
        "add-new-credential": {
          actions: "navigateToCredentialCatalog"
        },
        close: {
          actions: "navigateToWallet"
        }
      }
    },
    Failure: {
      entry: "navigateToFailureScreen",
      on: {
        close: {
          actions: "closeIssuance"
        },
        "request-assistance": {
          actions: "requestAssistance"
        }
      }
    }
  }
});
