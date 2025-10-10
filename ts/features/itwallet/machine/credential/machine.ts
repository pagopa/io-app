import { assign, fromPromise, not, setup } from "xstate";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { ItwTags } from "../tags";
import {
  GetWalletAttestationActorOutput,
  ObtainCredentialActorInput,
  ObtainCredentialActorOutput,
  ObtainStatusAssertionActorInput,
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
    handleSessionExpired: notImplemented,

    /**
     * Context manipulation actions
     */

    setFailure: assign(({ event }) => ({ failure: mapEventToFailure(event) })),

    /**
     * Navigation actions
     */

    navigateToTrustIssuerScreen: notImplemented,
    navigateToCredentialPreviewScreen: notImplemented,
    navigateToFailureScreen: notImplemented,
    navigateToWallet: notImplemented,
    navigateToEidVerificationExpiredScreen: notImplemented,
    closeIssuance: notImplemented,

    /**
     * Store actions
     */

    storeWalletInstanceAttestation: notImplemented,
    storeCredential: notImplemented,
    flagCredentialAsRequested: notImplemented,
    unflagCredentialAsRequested: notImplemented,

    /**
     * Analytics actions
     */

    trackStartAddCredential: notImplemented,
    trackStartCredentialReissuing: notImplemented,
    trackAddCredential: notImplemented,
    trackCredentialIssuingDataShare: notImplemented,
    trackCredentialIssuingDataShareAccepted: notImplemented
  },
  actors: {
    verifyTrustFederation: fromPromise<void>(notImplemented),
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
    obtainStatusAssertion: fromPromise<
      Array<StoredCredential>,
      ObtainStatusAssertionActorInput
    >(notImplemented)
  },
  guards: {
    isSessionExpired: notImplemented,
    isDeferredIssuance: notImplemented,
    hasValidWalletInstanceAttestation: notImplemented,
    isStatusError: notImplemented,
    isEidExpired: notImplemented
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
      tags: [ItwTags.Loading],
      on: {
        "select-credential": {
          target: "EvaluateFlow",
          actions: assign(({ event }) => ({
            credentialType: event.credentialType,
            mode: event.mode
          }))
        }
      }
    },
    EvaluateFlow: {
      always: [
        {
          guard: "isEidExpired",
          actions: "navigateToEidVerificationExpiredScreen",
          target: "Idle"
        },
        {
          guard: ({ context }) => context.mode === "issuance",
          target: "TrustFederationVerification",
          actions: ["trackStartAddCredential"]
        },
        {
          guard: ({ context }) => context.mode === "upgrade",
          target: "TrustFederationVerification",
          actions: [
            "trackStartCredentialReissuing",
            "navigateToTrustIssuerScreen"
          ]
        },
        {
          target: "TrustFederationVerification",
          actions: ["trackStartAddCredential", "navigateToTrustIssuerScreen"]
        }
      ]
    },
    TrustFederationVerification: {
      description:
        "Verification of the trust federation. This state verifies the trust chain of the wallet provider with the EAA provider.",
      tags: [ItwTags.Loading],
      invoke: {
        src: "verifyTrustFederation",
        onDone: {
          target: "CheckingWalletInstanceAttestation"
        },
        onError: [
          {
            actions: "setFailure",
            target: "#itwCredentialIssuanceMachine.Failure"
          }
        ]
      },
      after: {
        5000: {
          actions: "navigateToTrustIssuerScreen"
        }
      }
    },
    CheckingWalletInstanceAttestation: {
      description:
        "This is a state with the only purpose of checking the WIA and decide wether to get a new one or not",
      tags: [ItwTags.Loading],
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
          walletInstanceAttestation: context.walletInstanceAttestation?.jwt,
          skipMdocIssuance: !context.isItWalletValid // Do not request mDoc credentials for non IT-Wallet instances
        }),
        onDone: {
          target: "DisplayingTrustIssuer",
          actions: assign(({ event }) => ({
            clientId: event.output.clientId,
            codeVerifier: event.output.codeVerifier,
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
      entry: ["trackCredentialIssuingDataShare"],
      always: {
        actions: "navigateToTrustIssuerScreen"
      },
      on: {
        "confirm-trust-data": {
          actions: "trackCredentialIssuingDataShareAccepted",
          target: "Issuance"
        },
        close: {
          target: "Completed",
          actions: "closeIssuance"
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
              walletInstanceAttestation: context.walletInstanceAttestation?.jwt,
              clientId: context.clientId,
              codeVerifier: context.codeVerifier,
              requestedCredential: context.requestedCredential,
              issuerConf: context.issuerConf,
              operationType:
                context.mode === "upgrade" ? "reissuing" : undefined
            }),
            onDone: {
              target: "ObtainingStatusAssertion",
              actions: assign(({ event }) => ({
                credentials: event.output.credentials
              }))
            },
            onError: {
              target: "#itwCredentialIssuanceMachine.Failure",
              actions: "setFailure"
            }
          }
        },
        ObtainingStatusAssertion: {
          invoke: {
            src: "obtainStatusAssertion",
            input: ({ context }) => ({
              credentials: context.credentials
            }),
            onDone: {
              target: "Completed",
              actions: assign(({ event }) => ({
                credentials: event.output
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
          target: "Completed",
          actions: "closeIssuance"
        }
      }
    },
    Completed: {
      type: "final"
    },
    Failure: {
      entry: ["navigateToFailureScreen"],
      always: [
        {
          guard: "isDeferredIssuance",
          actions: "flagCredentialAsRequested"
        },
        {
          guard: "isStatusError",
          actions: "unflagCredentialAsRequested"
        }
      ],
      on: {
        close: {
          actions: "closeIssuance"
        },
        retry: {
          target: "#itwCredentialIssuanceMachine.RequestingCredential"
        }
      }
    }
  }
});

export type ItwCredentialIssuanceMachine = typeof itwCredentialIssuanceMachine;
