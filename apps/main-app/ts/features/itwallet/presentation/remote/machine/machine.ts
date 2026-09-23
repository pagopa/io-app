import { assign, not } from "xstate";

import { InitialContext } from "./context";
import { RemoteFailureType } from "./failure";
import { itwRemoteMachineSetup } from "./setup";
import { ItwPresentationTags } from "./tags";

export const itwRemoteMachine = itwRemoteMachineSetup.createMachine({
  id: "itwRemoteMachine",
  context: ({ input }) => ({ ...InitialContext, deps: input.deps }),
  initial: "Idle",
  entry: "onInit",
  on: {
    reset: {
      target: ".Idle",
      actions: assign(({ context }) => ({
        ...InitialContext,
        deps: context.deps,
        walletInstanceAttestation: context.walletInstanceAttestation
      }))
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
            payload: event.payload,
            flowType: event.flowType
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
          target: "CheckingWalletInstanceAttestation"
        }
      ]
    },
    EvaluatingClientIdType: {
      description:
        "Route to the appropriate flow based on the client_id type - openid_federation or x509_hash",
      always: [
        {
          guard: "isOpenIdFederationClient",
          target: "EvaluatingRelyingPartyTrust"
        },
        {
          guard: "isX509HashClient",
          target: "GettingRequestObject"
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
          target: "EvaluatingClientIdType"
        }
      ]
    },
    ObtainingWalletInstanceAttestation: {
      description:
        "Fetch a new Wallet Attestation and store it in the global state",
      tags: [ItwPresentationTags.Loading],
      invoke: {
        src: "getWalletAttestation",
        input: ({ context }) => ({ deps: context.deps }),
        onDone: {
          target: "EvaluatingClientIdType",
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
        input: ({ context }) => ({
          qrCodePayload: context.payload,
          deps: context.deps
        }),
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
          qrCodePayload: context.payload,
          deps: context.deps
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
          walletInstanceAttestation: context.walletInstanceAttestation,
          credentials: context.credentials,
          qrCodePayload: context.payload,
          requestObjectEncodedJwt: context.requestObjectEncodedJwt,
          rpConf: context.rpConf,
          deps: context.deps
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
          optionalCredentials: context.selectedOptionalCredentials,
          deps: context.deps
        }),
        onDone: {
          actions: assign(({ event }) => ({
            redirectUri: event.output.redirectUri,
            presentedKeyTags: event.output.presentedKeyTags
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
      entry: "consumePresentedBatchCredentials",
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
