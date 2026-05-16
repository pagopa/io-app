import {
  and,
  assign,
  fromCallback,
  fromPromise,
  not,
  setup,
  stateIn
} from "xstate";
import {
  SendErrorResponseActorOutput,
  SendDocumentsActorInput,
  SendDocumentsActorOutput,
  ProximityCommunicationLogicInput,
  StartEngagementActorInput
} from "./actors";
import { Context, InitialContext } from "./context";
import { ProximityEvents } from "./events";
import { mapEventToFailure } from "./failure";
import { ItwPresentationTags } from "./tags";

const notImplemented = () => {
  throw new Error("Not implemented");
};

export const itwProximityMachine = setup({
  types: {
    context: {} as Context,
    events: {} as ProximityEvents
  },
  actions: {
    onInit: notImplemented,
    /**
     * Context manipulation
     */

    setFailure: assign(({ event }) => ({ failure: mapEventToFailure(event) })),

    /**
     * Navigation
     */

    navigateToBluetoothPermissionsScreen: notImplemented,
    navigateToBluetoothActivationScreen: notImplemented,
    navigateToNfcActivationScreen: notImplemented,
    navigateToNfcPresentmentScreen: notImplemented,
    navigateToFailureScreen: notImplemented,
    navigateToClaimsDisclosureScreen: notImplemented,
    navigateToSuccessScreen: notImplemented,
    closeProximity: notImplemented,

    /**
     * Consents
     */

    grantConsent: assign({ hasGrantedConsent: true }),
    storeConsent: notImplemented,

    /**
     * Proximity
     */

    attemptSessionTermination: notImplemented
  },
  actors: {
    checkBluetoothPermissions: fromPromise<boolean>(notImplemented),
    checkBluetoothActivation: fromPromise<boolean>(notImplemented),
    checkNfcActivation: fromPromise<boolean>(notImplemented),
    proximityCommunicationLogic: fromCallback<
      ProximityEvents,
      ProximityCommunicationLogicInput
    >(notImplemented),
    startEngagement: fromPromise<void, StartEngagementActorInput>(
      notImplemented
    ),
    sendDocuments: fromPromise<
      SendDocumentsActorOutput,
      SendDocumentsActorInput
    >(notImplemented),
    terminateProximitySession:
      fromPromise<SendErrorResponseActorOutput>(notImplemented)
  },
  guards: {
    hasFailure: ({ context }) => !!context.failure,
    isNfcRetrieval: ({ context }) => context.retrievalMethod === "nfc",
    hasGrantedConsent: notImplemented
  }
}).createMachine({
  id: "itwProximityMachine",
  context: { ...InitialContext },
  initial: "Idle",
  entry: "onInit",
  states: {
    Idle: {
      description: "Initial state, awaiting the start of the flow",
      on: {
        start: {
          target: "Bluetooth"
        }
      }
    },
    Bluetooth: {
      tags: [ItwPresentationTags.Loading],
      description: "Bluetooth permission and activation gate",
      initial: "CheckPermissions",
      states: {
        CheckPermissions: {
          description: "Check if Bluetooth permissions are granted",
          invoke: {
            src: "checkBluetoothPermissions",
            onDone: [
              {
                guard: ({ event }) => event.output,
                target: "CheckActivation"
              },
              {
                target: "RequirePermissions"
              }
            ],
            onError: {
              target: "RequirePermissions"
            }
          }
        },
        RequirePermissions: {
          description: "Prompt the user to grant Bluetooth permissions",
          entry: "navigateToBluetoothPermissionsScreen",
          on: {
            close: {
              actions: "closeProximity"
            },
            continue: {
              target: "CheckActivation"
            }
          }
        },
        CheckActivation: {
          description: "Check if Bluetooth is enabled",
          invoke: {
            src: "checkBluetoothActivation",
            onDone: [
              {
                guard: ({ event }) => event.output,
                target: "Completed"
              },
              {
                target: "RequireActivation"
              }
            ],
            onError: {
              target: "RequireActivation"
            }
          }
        },
        RequireActivation: {
          description: "Prompt the user to enable Bluetooth",
          entry: "navigateToBluetoothActivationScreen",
          on: {
            close: {
              actions: "closeProximity"
            },
            continue: {
              target: "Completed"
            }
          }
        },
        Completed: {
          description: "Bluetooth gate cleared",
          type: "final"
        }
      },
      onDone: {
        target: "#itwProximityMachine.Presentment"
      }
    },
    Nfc: {
      description: "NFC activation gate, entered only when the user opts in",
      initial: "CheckActivation",
      states: {
        CheckActivation: {
          description: "Check if NFC is enabled",
          invoke: {
            src: "checkNfcActivation",
            onDone: [
              {
                guard: ({ event }) => event.output,
                target: "Completed"
              },
              {
                guard: ({ event }) => !event.output,
                target: "RequireActivation"
              }
            ],
            onError: {
              target: "RequireActivation"
            }
          }
        },
        RequireActivation: {
          description: "Prompt the user to enable NFC",
          entry: "navigateToNfcActivationScreen",
          on: {
            close: {
              // Back to the QR engagement still in progress, without committing to NFC
              target: "#itwProximityMachine.Presentment"
            },
            continue: {
              target: "Completed"
            }
          }
        },
        Completed: {
          description: "NFC gate cleared",
          type: "final"
        }
      },
      onDone: {
        // External transition to Presentment fully restarts proximityCommunicationLogic
        // and startEngagement so the native session runs with the NFC configuration
        target: "#itwProximityMachine.Presentment",
        actions: [
          assign({ engagementMode: "nfc" }),
          "navigateToNfcPresentmentScreen"
        ]
      }
    },
    Presentment: {
      description:
        "Proximity communication lifecycle with the verifier, driven by context.engagementMode",
      initial: "Starting",
      invoke: {
        id: "proximityCommunicationLogic",
        src: "proximityCommunicationLogic",
        input: ({ context }) => ({
          credentials: context.credentials
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
            // END (0x02) flag received BEFORE sendDocuments: verifier aborted
            actions: "setFailure",
            target: "Presentment.Terminating"
          }
        ],
        "device-error": {
          actions: "setFailure",
          target: "Presentment.Terminating"
        }
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
          invoke: {
            src: "startEngagement",
            input: ({ context }) => ({
              engagementMode: context.engagementMode
            }),
            onDone: {
              target: "AwaitingConnection"
            },
            onError: {
              actions: ["setFailure"]
            }
          },
          on: {
            retry: {
              target: "Retrying"
            }
          }
        },
        AwaitingConnection: {
          description:
            "Engagement is live, waiting for the verifier to connect",
          tags: [ItwPresentationTags.Presenting],
          on: {
            "start-nfc-presentment": {
              target: "#itwProximityMachine.Nfc"
            },
            "nfc-stopped": {
              target: "Terminating"
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
          tags: [ItwPresentationTags.Loading]
        },
        Connected: {
          description: "Verifier connected, waiting for the document request",
          tags: [ItwPresentationTags.Loading]
        },
        EvaluatingConsent: {
          description:
            "Decide whether to surface the consent screen or skip it",
          always: [
            {
              // NFC retrieval re-enters this state after consent was already granted earlier in the session
              guard: and(["hasGrantedConsent", "isNfcRetrieval"]),
              target: "#itwProximityMachine.Presentment.SendingDocuments"
            },
            {
              target: "#itwProximityMachine.Presentment.ClaimsDisclosure"
            }
          ]
        },
        ClaimsDisclosure: {
          description: "Display the requested claims for review",
          entry: "navigateToClaimsDisclosureScreen",
          always: {
            // NFC retrieval requires terminating the current session before the verifier can restart it
            guard: "isNfcRetrieval",
            actions: "attemptSessionTermination"
          },
          on: {
            "holder-consent": [
              {
                // NFC retrieval: restart the engagement so the verifier re-issues the request;
                // EvaluatingConsent will then skip this screen and go straight to SendingDocuments
                guard: "isNfcRetrieval",
                actions: "grantConsent",
                target: "#itwProximityMachine.Presentment.Retrying"
              },
              {
                actions: "grantConsent",
                target: "#itwProximityMachine.Presentment.SendingDocuments"
              }
            ],
            back: {
              target: "#itwProximityMachine.Presentment.Terminating"
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
              walletInstanceAttestation: context.walletInstanceAttestation,
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
          description: "Send the session-termination signal to the verifier",
          invoke: {
            id: "terminateProximitySession",
            src: "terminateProximitySession",
            onDone: [
              {
                guard: "hasFailure",
                target: "#itwProximityMachine.Failure"
              },
              {
                actions: "closeProximity"
              }
            ],
            onError: [
              {
                guard: "hasFailure",
                target: "#itwProximityMachine.Failure"
              },
              {
                actions: "closeProximity"
              }
            ]
          }
        }
      }
    },
    Success: {
      description: "Documents successfully sent to the verifier",
      // The loading tag prevents glitches while navigating to the success screen
      tags: [ItwPresentationTags.Loading],
      always: {
        // NFC retrieval renders success inline on its own screen, no navigation needed
        guard: not("isNfcRetrieval"),
        actions: "navigateToSuccessScreen"
      },
      on: {
        close: {
          actions: "closeProximity",
          target: "Idle"
        }
      }
    },
    Failure: {
      description: "An error occurred, captured in context.failure",
      entry: "navigateToFailureScreen",
      on: {
        close: {
          actions: "closeProximity",
          target: "Idle"
        }
      }
    }
  }
});

export type ItwProximityMachine = typeof itwProximityMachine;
