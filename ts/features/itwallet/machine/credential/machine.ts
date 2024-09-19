import { assign, fromPromise, setup } from "xstate5";
import { ItwTags } from "../tags";
import { ItwSessionExpiredError } from "../../api/client";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import {
  InitializeWalletActorOutput,
  ObtainCredentialActorInput,
  ObtainCredentialActorOutput,
  ObtainStatusAttestationActorInput,
  RequestCredentialActorInput,
  RequestCredentialActorOutput
} from "./actors";
import { Context, InitialContext } from "./context";
import { CredentialIssuanceEvents } from "./events";
import { mapEventToFailure } from "./failure";

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
    closeIssuance: notImplemented,
    setFailure: assign(({ event }) => ({ failure: mapEventToFailure(event) })),
    handleSessionExpired: notImplemented
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
    obtainStatusAttestation: fromPromise<
      StoredCredential,
      ObtainStatusAttestationActorInput
    >(notImplemented)
  },
  guards: {
    isSessionExpired: ({ event }: { event: CredentialIssuanceEvents }) =>
      "error" in event && event.error instanceof ItwSessionExpiredError
  }
}).createMachine({
  id: "itwCredentialIssuanceMachine",
  context: InitialContext,
  initial: "Idle",
  states: {
    Idle: {
      entry: assign(() => InitialContext),
      on: {
        "select-credential": [
          {
            guard: ({ event }) => !event.skipNavigation,
            target: "WalletInitialization",
            actions: [
              assign(({ event }) => ({
                credentialType: event.credentialType
              })),
              "navigateToTrustIssuerScreen"
            ]
          },
          {
            target: "WalletInitialization",
            actions: assign(({ event }) => ({
              credentialType: event.credentialType
            }))
          }
        ]
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
        onError: [
          {
            guard: "isSessionExpired",
            target: "SessionExpired"
          },
          {
            target: "#itwCredentialIssuanceMachine.Failure",
            actions: "setFailure"
          }
        ]
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
          target: "#itwCredentialIssuanceMachine.Failure",
          actions: "setFailure"
        }
      }
    },
    DisplayingTrustIssuer: {
      entry: "navigateToTrustIssuerScreen",
      on: {
        "confirm-trust-data": {
          target: "Issuance"
        },
        close: {
          actions: ["closeIssuance"]
        }
      }
    },
    Issuance: {
      initial: "ObtainingCredential",
      tags: [ItwTags.Issuing],
      states: {
        ObtainingCredential: {
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
              target: "ObtainingStatusAttestation",
              actions: assign(({ event }) => ({
                credential: event.output.credential
              }))
            },
            onError: [
              {
                target: "#itwCredentialIssuanceMachine.Failure",
                actions: "setFailure"
              }
            ]
          }
        },
        ObtainingStatusAttestation: {
          invoke: {
            src: "obtainStatusAttestation",
            input: ({ context }) => ({ credential: context.credential }),
            onDone: {
              target: "Completed",
              actions: assign(({ event }) => ({
                credential: event.output
              }))
            },
            onError: {
              target: "#itwCredentialIssuanceMachine.Failure",
              actions: "setFailure"
            }
          }
        },
        Completed: {
          type: "final"
        }
      },
      after: {
        // If this step takes more than 4 seconds, we navigate to the next screen and display a loading indicator
        4000: {
          actions: "navigateToCredentialPreviewScreen"
        }
      },
      onDone: {
        target: "DisplayingCredentialPreview"
      }
    },
    DisplayingCredentialPreview: {
      entry: "navigateToCredentialPreviewScreen",
      on: {
        "add-to-wallet": {
          actions: ["storeCredential", "navigateToWallet"]
        },
        close: {
          actions: ["closeIssuance"]
        }
      }
    },
    Failure: {
      entry: ["navigateToFailureScreen"],
      on: {
        close: {
          actions: ["closeIssuance"]
        },
        reset: {
          target: "Idle"
        },
        retry: {
          target: "#itwCredentialIssuanceMachine.RequestingCredential"
        }
      }
    },
    SessionExpired: {
      entry: ["handleSessionExpired"],
      // Since the refresh token request does not change the current screen, restart the machine
      always: { target: "Idle" }
    }
  }
});

export type ItwCredentialIssuanceMachine = typeof itwCredentialIssuanceMachine;
