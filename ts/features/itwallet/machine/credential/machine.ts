import { assign, fromPromise, setup } from "xstate5";
import { ItwTags } from "../tags";
import {
  InitializeWalletActorOutput,
  ObtainCredentialActorInput,
  ObtainCredentialActorOutput,
  RequestCredentialActorInput,
  RequestCredentialActorOutput
} from "./actors";
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
    navigateToTrustIssuerScreen: notImplemented,
    navigateToCredentialPreviewScreen: notImplemented,
    navigateToFailureScreen: notImplemented,
    navigateToWallet: notImplemented,
    storeCredential: notImplemented,
    disposeWallet: notImplemented,
    closeIssuance: notImplemented
  },
  actors: {
    initializeWallet: fromPromise<InitializeWalletActorOutput>(notImplemented),
    requestCredential: fromPromise<
      RequestCredentialActorOutput,
      RequestCredentialActorInput
    >(notImplemented),
    obtainCredential: fromPromise<
      ObtainCredentialActorOutput,
      ObtainCredentialActorInput
    >(notImplemented),
    disposeWallet: fromPromise(notImplemented)
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
      invoke: {
        src: "initializeWallet",
        onDone: {
          target: "Identification",
          actions: assign(({ event }) => ({
            walletInstanceAttestation: event.output.walletInstanceAttestation,
            wiaCryptoContext: event.output.wiaCryptoContext
          }))
        },
        onError: {
          target: "Failure"
        }
      }
    },
    RequestingCredential: {
      tags: [ItwTags.Loading],
      invoke: {
        src: "requestCredential",
        input: ({ context }) => ({
          credentialType: context.credentialType,
          walletInstanceAttestation: context.walletInstanceAttestation,
          wiaCryptoContext: context.wiaCryptoContext
        }),
        onDone: {
          target: "DisplayingTrustIssuer",
          actions: assign(({ event }) => ({
            requestedCredential: event.output.requestedCredential
          }))
        },
        onError: {
          target: "Failure"
        }
      }
    },
    DisplayingTrustIssuer: {
      entry: "navigateToTrustIssuerScreen",
      on: {
        "confirm-auth-data": {
          target: "ObtainingCredential"
        },
        close: {
          actions: ["closeIssuance", "disposeWallet"]
        }
      }
    },
    ObtainingCredential: {
      tags: [ItwTags.Loading],
      initial: "Loading",
      invoke: {
        src: "obtainCredential",
        input: ({ context }) => ({
          credentialType: context.credentialType,
          walletInstanceAttestation: context.walletInstanceAttestation,
          wiaCryptoContext: context.wiaCryptoContext,
          clientId: context.clientId,
          codeVerifier: context.codeVerifier,
          credentialDefinition: context.credentialDefinition,
          requestedCredential: context.requestedCredential,
          issuerConf: context.issuerConf
        }),
        onDone: {
          target: "DisplayingCredentialPreview",
          actions: assign(({ event }) => ({
            credential: event.output.credential
          })),
          onError: {
            target: "Failure"
          }
        }
      },
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
      }
    },
    DisplayingCredentialPreview: {
      entry: "navigateToCredentialPreviewScreen",
      on: {
        "add-to-wallet": {
          actions: ["storeCredential", "navigateToWallet", "disposeWallet"]
        },
        close: {
          actions: "closeIssuance"
        }
      }
    },
    Failure: {
      entry: ["navigateToFailureScreen", "disposeWallet"],
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
