import { assign, fromPromise, setup } from "xstate5";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { ItwTags } from "../tags";
import { Context, InitialContext } from "./context";
import { CredentialIssuanceEvents } from "./events";

const notImplemented = () => {
  throw new Error("Not implemented");
};

export const itwCredentialIssuanceMachine = setup({
  types: {
    context: {} as Context,
    events: {} as CredentialIssuanceEvents
  },
  actions: {
    navigateToAuthDataScreen: notImplemented,
    navigateToCredentialPreviewScreen: notImplemented,
    navigateToFailureScreen: notImplemented,
    navigateToWallet: notImplemented,
    storeCredential: notImplemented,
    closeIssuance: notImplemented
  },
  actors: {
    getWalletAttestation: fromPromise<string>(notImplemented),
    requestCredential: fromPromise<
      StoredCredential,
      StoredCredential | undefined
    >(notImplemented)
  }
}).createMachine({
  id: "itwCredentialIssuanceMachine",
  context: InitialContext,
  initial: "Idle",
  states: {
    Idle: {
      entry: assign(() => InitialContext),
      on: {
        "select-credential": {
          target: "WalletInitialization",
          actions: assign(({ event }) => ({
            credentialType: event.credentialType
          }))
        }
      }
    },
    WalletInitialization: {
      tags: [ItwTags.Loading],
      description: "Wallet attestation issuance",
      invoke: {
        src: "getWalletAttestation",
        onDone: {
          target: "Identification"
        },
        onError: {
          target: "Failure"
        }
      }
    },
    Identification: {
      description: "User is identified using the eID",
      entry: "navigateToAuthDataScreen",
      on: {
        "confirm-auth-data": {
          target: "RequestingCredential"
        },
        close: {
          actions: "closeIssuance"
        }
      }
    },
    RequestingCredential: {
      tags: [ItwTags.Loading],
      initial: "Loading",
      states: {
        Loading: {
          description: "Dummy state. Credential is being requested"
        },
        Hanging: {
          description:
            "Credential is hanging. We navigate to the next screen and show a loading message",
          entry: "navigateToCredentialPreviewScreen"
        }
      },
      after: {
        4000: {
          target: ".Hanging"
        }
      },
      invoke: {
        src: "requestCredential",
        input: ({ context }) => context.eid,
        onDone: {
          actions: assign(({ event }) => ({ credential: event.output })),
          target: "DisplayingCredentialPreview"
        },
        onError: {
          target: "Failure"
        }
      }
    },
    DisplayingCredentialPreview: {
      entry: "navigateToCredentialPreviewScreen",
      on: {
        "add-to-wallet": {
          actions: ["storeCredential", "navigateToWallet"]
        },
        close: {
          actions: "closeIssuance"
        }
      }
    },
    Failure: {
      entry: "navigateToFailureScreen",
      on: {
        close: {
          actions: "closeIssuance"
        },
        reset: {
          target: "Idle"
        }
      }
    }
  }
});
