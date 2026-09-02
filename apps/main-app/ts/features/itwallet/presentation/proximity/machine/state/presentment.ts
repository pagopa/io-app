import { and, assign, not, or, stateIn } from "xstate";

import { ProximityFailureType } from "../failure";
import { itwProximityMachineSetup } from "../setup";
import { ItwPresentationTags } from "../tags";

/** Manages verifier connection, holder consent, and document transmission. */
export const presentmentState = itwProximityMachineSetup.createStateConfig({
  description:
    "Proximity communication lifecycle with the verifier, driven by context.engagementMode",
  initial: "Starting",
  invoke: {
    id: "proximityCommunicationLogic",
    src: "proximityCommunicationLogic",
    input: ({ context }) => ({
      credentials: context.credentials,
      deps: context.deps
    }),
    onError: {
      actions: "setFailure",
      target: "#itwProximityMachine.Failure"
    }
  },
  on: {
    "qr-code-string": {
      target: "Presentment.AwaitingConnection",
      actions: assign(({ event }) => ({
        qrCodeString: event.payload
      }))
    },
    "device-connecting": {
      target: "Presentment.Connecting"
    },
    "device-connected": {
      target: "Presentment.Connected"
    },
    "device-document-request-received": {
      actions: assign(({ event }) => ({
        proximityDetails: event.proximityDetails,
        verifierRequest: event.verifierRequest,
        retrievalMethod: event.retrievalMethod
      })),
      target: "Presentment.EvaluatingConsent"
    },
    "device-disconnected": [
      {
        // END (0x02) flag received AFTER sendDocuments: verification complete
        guard: stateIn("Presentment.SendingDocuments"),
        target: "#itwProximityMachine.Success"
      },
      {
        // Expected disconnect after intentional session termination for NFC
        // retrieval — both while tearing the session down (TerminatingForConsent)
        // and while the user reviews the request (ClaimsDisclosure).
        guard: and([
          or([
            stateIn("Presentment.TerminatingForConsent"),
            stateIn("Presentment.ClaimsDisclosure")
          ]),
          "isNfcRetrieval"
        ])
      },
      {
        // END (0x02) flag received BEFORE sendDocuments: verifier aborted
        actions: "setFailure",
        target: "Presentment.Terminating"
      }
    ],
    "device-error": [
      {
        // Expected error during intentional session termination for NFC
        // retrieval — consumed without failure, matching device-disconnected.
        guard: and([
          or([
            stateIn("Presentment.TerminatingForConsent"),
            stateIn("Presentment.ClaimsDisclosure")
          ]),
          "isNfcRetrieval"
        ])
      },
      {
        guard: not(stateIn("Presentment.Terminating")),
        actions: "setFailure",
        target: "#itwProximityMachine.Failure"
      }
    ]
  },
  states: {
    Retrying: {
      description: "Clear the failure and restart the engagement",
      tags: [ItwPresentationTags.Loading],
      always: {
        target: "Starting",
        actions: assign(() => ({ failure: undefined }))
      }
    },
    Starting: {
      description: "Start the native engagement session",
      tags: [ItwPresentationTags.Loading],
      always: {
        guard: "isNfcRetrieval",
        actions: "navigateToNfcPresentmentScreen"
      },
      invoke: {
        src: "startEngagement",
        input: ({ context }) => ({
          engagementMode: context.engagementMode,
          deps: context.deps
        }),
        onDone: {
          target: "AwaitingConnection"
        },
        onError: [
          {
            guard: "isNfcRetrieval",
            actions: "setFailure",
            target: "#itwProximityMachine.Failure"
          },
          {
            actions: ["setFailure", "trackQrCodeLoadingFailure"]
          }
        ]
      },
      on: {
        retry: {
          target: "Retrying"
        }
      }
    },
    AwaitingConnection: {
      description: "Engagement is live, waiting for the verifier to connect",
      tags: [ItwPresentationTags.Presenting],
      on: {
        "start-nfc-presentment": {
          target: "#itwProximityMachine.Nfc"
        },
        "nfc-stopped": {
          // NFC session has ended (HCE modal closed)
          actions: "closeProximity"
        },
        retry: {
          target: "Retrying"
        },
        close: {
          actions: "closeProximity"
        }
      }
    },
    Connecting: {
      description: "Verifier is initiating the connection",
      tags: [ItwPresentationTags.Loading],
      always: {
        // Pre-navigate to the (loading) claims screen for QR engagement only.
        guard: not("isNfcEngagement"),
        actions: "navigateToClaimsDisclosureScreen"
      },
      on: {
        // NFC session has ended (HCE modal closed)
        "nfc-stopped": "Terminating"
      }
    },
    Connected: {
      description: "Verifier connected, waiting for the document request",
      tags: [ItwPresentationTags.Loading],
      on: {
        // In case of connection timeout, allows the user to exit the flow
        close: {
          actions: "closeProximity",
          target: "#itwProximityMachine.Idle"
        }
      }
    },
    EvaluatingConsent: {
      description: "Decide whether to surface the consent screen or skip it",
      always: [
        {
          // NFC retrieval re-enters this state after consent was already granted earlier in the session
          guard: and(["hasGrantedConsent", "isNfcRetrieval"]),
          target: "#itwProximityMachine.Presentment.SendingDocuments"
        },
        {
          // NFC retrieval, consent not yet granted: the NFC link cannot be held
          // open while the user reviews the request, so tear the session down
          // (and release the SDK) before asking for consent.
          guard: "isNfcRetrieval",
          target: "#itwProximityMachine.Presentment.TerminatingForConsent"
        },
        {
          target: "#itwProximityMachine.Presentment.ClaimsDisclosure"
        }
      ]
    },
    ClaimsDisclosure: {
      description: "Display the requested claims for review",
      entry: "navigateToClaimsDisclosureScreen",
      on: {
        "holder-consent": [
          {
            // NFC retrieval: restart the engagement so the verifier re-issues the request;
            // EvaluatingConsent will then skip this screen and go straight to SendingDocuments
            guard: "isNfcRetrieval",
            actions: "grantConsent",
            target: "#itwProximityMachine.Presentment.StoreConsent"
          },
          {
            target: "#itwProximityMachine.Presentment.SendingDocuments"
          }
        ],
        close: {
          actions: assign(() => ({
            failure: {
              type: ProximityFailureType.CONSENT_DENIED,
              reason: undefined
            }
          })),
          target: "#itwProximityMachine.Failure"
        }
      }
    },
    TerminatingForConsent: {
      description:
        "NFC retrieval: terminate the live session and release the SDK before asking for consent, without leaving the proximity flow",
      tags: [ItwPresentationTags.Loading],
      invoke: {
        id: "terminateSession",
        src: "terminateSession",
        onDone: {
          target: "#itwProximityMachine.Presentment.ClaimsDisclosure"
        },
        onError: {
          // Ignore termination failures: proceed to consent and rely on the
          // restart's startEngagement to reset the native session.
          target: "#itwProximityMachine.Presentment.ClaimsDisclosure"
        }
      }
    },
    StoreConsent: {
      description:
        "Asks user if he want to save the consent for future requests",
      entry: "navigateToStoreconsentScreen",
      on: {
        "store-consent": {
          actions: "storeConsent",
          target: "#itwProximityMachine.Presentment.Retrying"
        },
        continue: {
          target: "#itwProximityMachine.Presentment.Retrying"
        }
      }
    },
    SendingDocuments: {
      description: "Send the accepted documents to the verifier",
      tags: [ItwPresentationTags.Loading, ItwPresentationTags.Sending],
      invoke: {
        id: "sendDocuments",
        src: "sendDocuments",
        input: ({ context }) => ({
          credentials: context.credentials,
          verifierRequest: context.verifierRequest
        }),
        onDone: {
          // Verifier does not acknowledge the response; completion arrives via device-disconnected
        },
        onError: {
          actions: "setFailure",
          target: "#itwProximityMachine.Failure"
        }
      }
    },
    Terminating: {
      tags: [ItwPresentationTags.Loading],
      description: "Send the session-termination signal to the verifier",
      invoke: {
        id: "terminateSession",
        src: "terminateSession",
        onDone: {
          actions: "closeProximity"
        },
        onError: {
          // We ignore any failure on purpose and consider presentation terminated
          actions: "closeProximity"
        }
      }
    }
  }
} as const);
