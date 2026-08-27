import { and, assign, not } from "xstate";

import { ItwTags } from "../tags";
import { InitialContext } from "./context";
import { itwCredentialSetup } from "./setup";
import { issuanceState } from "./state/issuance";

export { notImplemented } from "./setup";

export const itwCredentialIssuanceMachine = itwCredentialSetup.createMachine({
  id: "itwCredentialIssuanceMachine",
  context: { ...InitialContext },
  initial: "Idle",
  states: {
    Idle: {
      description:
        "Waits for a credential selection in order to proceed with the issuance",
      tags: [ItwTags.Loading],
      on: {
        "start-credential-offer": {
          target: "CredentialOfferValidation",
          actions: [
            "onInit",
            assign(({ event }) => ({
              credentialOfferUri: event.itwCredentialOfferUri,
              mode: "issuance"
            }))
          ]
        },
        "select-credential": {
          target: "EvaluateFlow",
          actions: [
            "onInit",
            assign(({ event }) => ({
              credentialType: event.credentialType,
              mode: event.mode
            }))
          ]
        }
      }
    },
    CredentialOfferValidation: {
      tags: [ItwTags.Loading],
      invoke: {
        src: "processCredentialOffer",
        input: ({ context }) => ({
          credentialOfferUri: context.credentialOfferUri
        }),
        onDone: {
          target: "CredentialOfferResolved",
          actions: assign(({ event }) => ({
            resolvedCredentialOffer: {
              offer: event.output.offer,
              grantDetails: event.output.grantDetails
            },
            credentialType:
              event.output.grantDetails.authorizationCodeGrant.scope
          }))
        },
        onError: {
          target: "#itwCredentialIssuanceMachine.Failure",
          actions: "setFailure"
        }
      },
      on: {
        close: {
          target: "Idle",
          actions: assign({
            credentialOfferUri: undefined,
            resolvedCredentialOffer: undefined,
            credentialType: undefined
          })
        }
      }
    },
    CredentialOfferResolved: {
      on: {
        "confirm-credential-offer": {
          target: "EvaluateFlow",
          actions: ["onInit", assign({ mode: "issuance" as const })]
        },
        close: {
          target: "Idle",
          actions: assign({
            credentialOfferUri: undefined,
            resolvedCredentialOffer: undefined,
            credentialType: undefined
          })
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
          guard: and([
            ({ context }) => context.mode === "issuance",
            ({ context }) => !context.resolvedCredentialOffer,
            "hasCredentialIntroContent"
          ]),
          target: "CredentialIntroduction",
          actions: ["trackStartAddCredential"]
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
    CredentialIntroduction: {
      entry: "navigateToCredentialIntroductionScreen",
      on: {
        continue: {
          target: "TrustFederationVerification"
        },
        back: {
          target: "Idle",
          actions: [assign({ credentialType: undefined })]
        }
      }
    },
    TrustFederationVerification: {
      description:
        "Verification of the trust federation. This state verifies the trust chain of the wallet provider with the EAA provider.",
      tags: [ItwTags.Loading],
      invoke: {
        src: "verifyTrustFederation",
        input: ({ context }) => ({
          resolvedCredentialOffer: context.resolvedCredentialOffer
        }),
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
          resolvedCredentialOffer: context.resolvedCredentialOffer,
          skipMdocIssuance: !context.isItWalletValid // Do not request mDoc credentials for non IT-Wallet instances
        }),
        onDone: {
          target: "DisplayingTrustIssuer",
          actions: assign(({ event }) => event.output)
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
    Issuance: issuanceState,
    DisplayingCredentialPreview: {
      entry: "navigateToCredentialPreviewScreen",
      on: {
        "add-to-wallet": {
          target: "Completed",
          actions: ["storeCredential", "navigateToWallet", "trackAddCredential"]
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
