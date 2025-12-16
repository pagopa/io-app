import { assign, fromPromise, not, setup } from "xstate";
import { type WalletInstanceAttestations } from "../../../common/utils/itwTypesUtils";
import { Context, InitialContext } from "./context";
import { mapEventToFailure, RemoteFailureType } from "./failure";
import { RemoteEvents } from "./events";
import { ItwPresentationTags } from "./tags";
import {
  EvaluateRelyingPartyTrustInput,
  EvaluateRelyingPartyTrustOutput,
  GetPresentationDetailsInput,
  GetPresentationDetailsOutput,
  GetRequestObjectInput,
  GetRequestObjectOutput,
  SendAuthorizationResponseInput,
  SendAuthorizationResponseOutput
} from "./actors";

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
    navigateToClaimsDisclosureScreen: notImplemented,
    navigateToIdentificationModeScreen: notImplemented,
    navigateToAuthResponseScreen: notImplemented,
    navigateToBarcodeScanScreen: notImplemented,
    closePresentation: notImplemented,
    trackRemoteDataShare: notImplemented,
    storeWalletInstanceAttestation: notImplemented,
    handleSessionExpired: notImplemented
  },
  actors: {
    evaluateRelyingPartyTrust: fromPromise<
      EvaluateRelyingPartyTrustOutput,
      EvaluateRelyingPartyTrustInput
    >(notImplemented),
    getRequestObject: fromPromise<
      GetRequestObjectOutput,
      GetRequestObjectInput
    >(notImplemented),
    getPresentationDetails: fromPromise<
      GetPresentationDetailsOutput,
      GetPresentationDetailsInput
    >(notImplemented),
    sendAuthorizationResponse: fromPromise<
      SendAuthorizationResponseOutput,
      SendAuthorizationResponseInput
    >(notImplemented),
    getWalletAttestation:
      fromPromise<WalletInstanceAttestations>(notImplemented)
  },
  guards: {
    isItWalletL3Active: notImplemented,
    isEidExpired: notImplemented,
    isSessionExpired: notImplemented,
    hasValidWalletInstanceAttestation: notImplemented
  }
}).createMachine({
  id: "itwRemoteMachine",
  context: { ...InitialContext },
  initial: "Idle",
  on: {
    reset: {
      target: ".Idle",
      actions: assign({ ...InitialContext })
    }
  },
  states: {
    Idle: {
      description:
        "The machine is in idle, ready to start the remote presentation flow",
      on: {
        reset: {}, // Do nothing if the machine is already idle
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
          guard: not("isItWalletL3Active"),
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
          target: "CheckingWalletInstanceAttestation"
        }
      ]
    },
    CheckingWalletInstanceAttestation: {
      description: "Check the validity of the Wallet Attestation to present",
      tags: [ItwPresentationTags.Loading],
      always: [
        {
          guard: not("hasValidWalletInstanceAttestation"),
          target: "ObtainingWalletInstanceAttestation"
        },
        {
          target: "EvaluatingRelyingPartyTrust"
        }
      ]
    },
    ObtainingWalletInstanceAttestation: {
      description:
        "Fetch a new Wallet Attestation and store it in the global state",
      tags: [ItwPresentationTags.Loading],
      invoke: {
        src: "getWalletAttestation",
        onDone: {
          target: "EvaluatingRelyingPartyTrust",
          actions: "storeWalletInstanceAttestation"
        },
        onError: [
          {
            guard: "isSessionExpired",
            actions: "handleSessionExpired",
            target: "Idle"
          },
          {
            target: "Failure",
            actions: "setFailure"
          }
        ]
      }
    },
    EvaluatingRelyingPartyTrust: {
      tags: [ItwPresentationTags.Loading],
      description: "Determine whether the Relying Party is a trusted entity",
      invoke: {
        src: "evaluateRelyingPartyTrust",
        input: ({ context }) => ({ qrCodePayload: context.payload }),
        onDone: {
          target: "GettingRequestObject",
          actions: assign(({ event }) => event.output)
        },
        onError: {
          actions: "setFailure",
          target: "Failure"
        }
      }
    },
    GettingRequestObject: {
      tags: [ItwPresentationTags.Loading],
      description: "Get the Request Object from the authorization Request",
      invoke: {
        src: "getRequestObject",
        input: ({ context }) => ({
          qrCodePayload: context.payload
        }),
        onDone: {
          actions: assign(({ event }) => ({
            requestObjectEncodedJwt: event.output
          })),
          target: "GettingPresentationDetails"
        },
        onError: {
          actions: "setFailure",
          target: "Failure"
        }
      }
    },
    GettingPresentationDetails: {
      tags: [ItwPresentationTags.Loading],
      description:
        "Get the details of the presentation requested by the Relying Party (i.e. credentials)",
      invoke: {
        src: "getPresentationDetails",
        input: ({ context }) => ({
          qrCodePayload: context.payload,
          rpSubject: context.rpSubject,
          requestObjectEncodedJwt: context.requestObjectEncodedJwt,
          rpConf: context.rpConf
        }),
        onDone: {
          actions: assign(({ event }) => event.output),
          target: "ClaimsDisclosure"
        },
        onError: {
          actions: "setFailure",
          target: "Failure"
        }
      }
    },
    ClaimsDisclosure: {
      entry: ["navigateToClaimsDisclosureScreen", "trackRemoteDataShare"],
      description:
        "Display the list of claims to disclose for the verifiable presentation",
      on: {
        "toggle-credential": {
          actions: assign(({ event: { credentialIds }, context }) => {
            const optionalCredentials = new Set(
              context.selectedOptionalCredentials
            );
            for (const id of credentialIds) {
              if (optionalCredentials.has(id)) {
                optionalCredentials.delete(id);
              } else {
                optionalCredentials.add(id);
              }
            }
            return { selectedOptionalCredentials: optionalCredentials };
          })
        },
        "holder-consent": {
          target: "SendingAuthorizationResponse"
        },
        close: {
          actions: "closePresentation"
        }
      }
    },
    SendingAuthorizationResponse: {
      tags: [ItwPresentationTags.Loading],
      entry: "navigateToAuthResponseScreen",
      description:
        "Create the Verifiable Presentation and send it to the Relying Party",
      invoke: {
        src: "sendAuthorizationResponse",
        input: ({ context }) => ({
          rpConf: context.rpConf,
          requestObject: context.requestObject,
          presentationDetails: context.presentationDetails,
          optionalCredentials: context.selectedOptionalCredentials
        }),
        onDone: {
          actions: assign(({ event }) => ({
            redirectUri: event.output.redirectUri
          })),
          target: "Success"
        },
        onError: {
          actions: "setFailure",
          target: "Failure"
        }
      }
    },
    Success: {
      description:
        "The Verifiable Presentation has been successfully sent to the Relying Party",
      on: {
        close: {
          actions: "closePresentation"
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
        "go-to-barcode-scan": {
          actions: "navigateToBarcodeScanScreen"
        },
        close: {
          actions: "closePresentation"
        }
      }
    }
  }
});

export type ItwRemoteMachine = typeof itwRemoteMachine;
