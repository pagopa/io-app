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
          target: "RequestingCredential",
          actions: assign(({ event }) => ({
            walletInstanceAttestation: event.output.walletInstanceAttestation,
            wiaCryptoContext: event.output.wiaCryptoContext
          }))
        },
        onError: {
          target: "#itwCredentialIssuanceMachine.Failure"
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
            clientId: event.output.clientId,
            codeVerifier: event.output.codeVerifier,
            credentialDefinition: event.output.credentialDefinition,
            requestedCredential: event.output.requestedCredential,
            issuerConf: event.output.issuerConf
          }))
        },
        onError: {
          target: "#itwCredentialIssuanceMachine.Failure"
        }
      }
    },
    DisplayingTrustIssuer: {
      entry: "navigateToTrustIssuerScreen",
      on: {
        "confirm-trust-data": {
          target: "ObtainingCredential"
        },
        close: {
          actions: ["closeIssuance", "disposeWallet"]
        }
      }
    },
    ObtainingCredential: {
      tags: [ItwTags.Loading],
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
          }))
        },
        onError: {
          target: "#itwCredentialIssuanceMachine.Failure"
        }
      },
      after: {
        // If this step takes more than 4 seconds, we navigate to the next screen and display a loading indicator
        4000: {
          actions: "navigateToCredentialPreviewScreen"
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
      entry: ["navigateToFailureScreen"],
      on: {
        close: {
          actions: ["closeIssuance", "disposeWallet"]
        },
        reset: {
          target: "Idle"
        },
        retry: {
          target: "#itwCredentialIssuanceMachine.DisplayingTrustIssuer"
        }
      }
    }
  }
});

export type ItwCredentialIssuanceMachine = typeof itwCredentialIssuanceMachine;
