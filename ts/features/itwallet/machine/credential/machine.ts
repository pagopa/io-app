import { assign, fromPromise, not, setup } from "xstate";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { ItwTags } from "../tags";
import {
  GetWalletAttestationActorOutput,
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
    onInit: notImplemented,
    navigateToTrustIssuerScreen: notImplemented,
    navigateToCredentialPreviewScreen: notImplemented,
    navigateToFailureScreen: notImplemented,
    navigateToWallet: notImplemented,
    closeIssuance: notImplemented,
    storeWalletInstanceAttestation: notImplemented,
    storeCredential: notImplemented,
    flagCredentialAsRequested: notImplemented,
    unflagCredentialAsRequested: notImplemented,
    setFailure: assign(({ event }) => ({ failure: mapEventToFailure(event) })),
    handleSessionExpired: notImplemented,
    trackStartAddCredential: notImplemented,
    trackAddCredential: notImplemented
  },
  actors: {
    getWalletAttestation:
      fromPromise<GetWalletAttestationActorOutput>(notImplemented),
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
    isSessionExpired: notImplemented,
    isDeferredIssuance: notImplemented,
    hasValidWalletInstanceAttestation: notImplemented
  }
}).createMachine({
  id: "itwCredentialIssuanceMachine",
  context: { ...InitialContext },
  initial: "Idle",
  entry: "onInit",
  states: {
    Idle: {
      description:
        "Waits for a credential selection in order to proceed with the issuance",
      on: {
        "select-credential": [
          {
            guard: ({ event }) => event.skipNavigation === true,
            target: "CheckingWalletInstanceAttestation",
            actions: [
              assign(({ event }) => ({
                credentialType: event.credentialType
              })),
              "trackStartAddCredential"
            ]
          },
          {
            target: "CheckingWalletInstanceAttestation",
            actions: [
              assign(({ event }) => ({
                credentialType: event.credentialType
              })),
              "navigateToTrustIssuerScreen",
              "trackStartAddCredential"
            ]
          }
        ]
      }
    },
    CheckingWalletInstanceAttestation: {
      description:
        "This is a state with the only purpose of checking the WIA and decide weather to get a new one or not",
      always: [
        {
          guard: not("hasValidWalletInstanceAttestation"),
          target: "ObtainingWalletInstanceAttestation"
        },
        {
          target: "RequestingCredential"
        }
      ]
    },
    ObtainingWalletInstanceAttestation: {
      description:
        "This state obtains the wallet instance attestation and stores it in the context for later use in the issuance flow.",
      tags: [ItwTags.Loading],
      invoke: {
        src: "getWalletAttestation",
        onDone: {
          target: "RequestingCredential",
          actions: [
            assign(({ event }) => ({
              walletInstanceAttestation: event.output
            })),
            "storeWalletInstanceAttestation"
          ]
        },
        onError: [
          {
            guard: "isSessionExpired",
            actions: "handleSessionExpired",
            target: "Idle"
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
          walletInstanceAttestation: context.walletInstanceAttestation
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
            onError: {
              target: "#itwCredentialIssuanceMachine.Failure",
              actions: "setFailure"
            }
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
          actions: [
            "storeCredential",
            "navigateToWallet",
            "trackAddCredential",
            "unflagCredentialAsRequested"
          ]
        },
        close: {
          actions: ["closeIssuance"]
        }
      }
    },
    Failure: {
      entry: ["navigateToFailureScreen"],
      always: [
        {
          guard: "isDeferredIssuance",
          actions: "flagCredentialAsRequested"
        }
      ],
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
    }
  }
});

export type ItwCredentialIssuanceMachine = typeof itwCredentialIssuanceMachine;
