import { assign, fromPromise, not, setup } from "xstate";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { ItwTags } from "../tags";
import {
  GetWalletAttestationActorInput,
  GetWalletAttestationActorOutput,
  ObtainCredentialActorInput,
  ObtainCredentialActorOutput,
  ObtainStatusAttestationActorInput,
  RequestCredentialActorInput,
  RequestCredentialActorOutput,
  VerifyTrustFederationActorInput
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
    navigateToEidVerificationExpiredScreen: notImplemented,
    closeIssuance: notImplemented,
    storeWalletInstanceAttestation: notImplemented,
    storeCredential: notImplemented,
    flagCredentialAsRequested: notImplemented,
    unflagCredentialAsRequested: notImplemented,
    setFailure: assign(({ event }) => ({ failure: mapEventToFailure(event) })),
    handleSessionExpired: notImplemented,
    trackStartAddCredential: notImplemented,
    trackAddCredential: notImplemented,
    trackCredentialIssuingDataShare: notImplemented,
    trackCredentialIssuingDataShareAccepted: notImplemented
  },
  actors: {
    verifyTrustFederation: fromPromise<void, VerifyTrustFederationActorInput>(
      notImplemented
    ),
    getWalletAttestation: fromPromise<
      GetWalletAttestationActorOutput,
      GetWalletAttestationActorInput
    >(notImplemented),
    requestCredential: fromPromise<
      RequestCredentialActorOutput,
      RequestCredentialActorInput
    >(notImplemented),
    obtainCredential: fromPromise<
      ObtainCredentialActorOutput,
      ObtainCredentialActorInput
    >(notImplemented),
    obtainStatusAttestation: fromPromise<
      Array<StoredCredential>,
      ObtainStatusAttestationActorInput
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
            mode: event.mode,
            isAsyncContinuation: event.isAsyncContinuation ?? false // TODO to be removed in [SIW-2839]
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
        input: ({ context }) => ({
          isNewIssuanceFlowEnabled: context.isWhiteListed
        }),
        src: "verifyTrustFederation",
        onDone: {
          target: "CheckingWalletInstanceAttestation"
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
        input: ({ context }) => ({
          isNewIssuanceFlowEnabled: context.isWhiteListed
        }),
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
          isNewIssuanceFlowEnabled: context.isWhiteListed
        }),
        onDone: {
          target: "DisplayingTrustIssuer",
          actions: assign(({ event }) => ({
            clientId: event.output.clientId,
            codeVerifier: event.output.codeVerifier,
            requestedCredential: event.output.requestedCredential,
            issuerConf: event.output.issuerConf,
            // TODO: [SIW-2530] In the new APIs is not needed
            credentialDefinition:
              "credentialDefinition" in event.output
                ? event.output.credentialDefinition
                : undefined
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
        // If we are in the async continuation flow means we are already showing the trust issuer screen
        // but on a different route. We need to avoid a navigation to show a "double" navigation animation.
        // TODO to be removed in [SIW-2839]
        guard: ({ context }) => !context.isAsyncContinuation,
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
              credentialDefinition: context.credentialDefinition,
              requestedCredential: context.requestedCredential,
              issuerConf: context.issuerConf,
              isNewIssuanceFlowEnabled: context.isWhiteListed,
              // If we are upprading the credential to the new forma we need to pass the operationType
              // header witth the value "reissuing"
              operationType:
                context.mode === "upgrade" ? "reissuing" : undefined
            }),
            onDone: [
              {
                // TODO: [SIW-2700]
                // For now, the `ObtainingStatusAttestation` is skipped for L3 issuance
                // until the status assertion flow is aligned with version 1.0
                guard: ({ context }) => !!context.isWhiteListed,
                target: "Completed",
                actions: assign(({ event }) => ({
                  credentials: event.output.credentials
                }))
              },
              {
                target: "ObtainingStatusAttestation",
                actions: assign(({ event }) => ({
                  credentials: event.output.credentials
                }))
              }
            ],
            onError: {
              target: "#itwCredentialIssuanceMachine.Failure",
              actions: "setFailure"
            }
          }
        },
        ObtainingStatusAttestation: {
          invoke: {
            src: "obtainStatusAttestation",
            input: ({ context }) => ({ credentials: context.credentials }),
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
