import { assign, fromCallback, fromPromise, not, setup, stateIn } from "xstate";
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
    setHasGivenConsent: assign({ hasGivenConsent: true }),

    /**
     * Navigation
     */

    navigateToBluetoothPermissionsScreen: notImplemented,
    navigateToBluetoothActivationScreen: notImplemented,
    navigateToNfcActivationScreen: notImplemented,
    navigateToPresentmentScreen: notImplemented,
    navigateToNfcPresentmentScreen: notImplemented,
    navigateToFailureScreen: notImplemented,
    navigateToClaimsDisclosureScreen: notImplemented,
    navigateToSuccessScreen: notImplemented,
    navigateToWallet: notImplemented,
    closeProximity: notImplemented
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
      fromPromise<SendErrorResponseActorOutput>(notImplemented),
    closeProximityFlow: fromPromise<boolean>(notImplemented)
  },
  guards: {
    hasFailure: ({ context }) => !!context.failure,
    isNfcRetrieval: ({ context }) => context.retrievalMethod === "nfc"
  }
}).createMachine({
  id: "itwProximityMachine",
  context: { ...InitialContext },
  initial: "Idle",
  entry: "onInit",
  states: {
    Idle: {
      description:
        "The machine is in idle, ready to start the proximity presentation flow",
      on: {
        start: {
          // Resets context except for the WIA and credentials
          actions: assign(() => ({
            failure: undefined,
            proximityDetails: undefined,
            verifierRequest: undefined
          })),
          target: "Bluetooth"
        },
        close: {
          actions: "closeProximity"
        }
      }
    },
    Bluetooth: {
      tags: [ItwPresentationTags.Loading],
      description: "Perform all the checks related to Bluetooth",
      initial: "CheckPermissions",
      states: {
        CheckPermissions: {
          description: "Check if bluetooth permissions have been granted",
          invoke: {
            src: "checkBluetoothPermissions",
            onDone: [
              {
                guard: ({ event }) => event.output,
                target: "CheckActivation"
              },
              {
                guard: ({ event }) => !event.output,
                target: "RequirePermissions"
              }
            ],
            onError: {
              target: "RequirePermissions"
            }
          }
        },
        RequirePermissions: {
          description:
            "Display the screen prompting the user to grant bluetooth permissions",
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
          entry: "navigateToBluetoothActivationScreen",
          description:
            "Display the screen prompting the user to enable Bluetooth",
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
          description: "Bluetooth checks are completed",
          type: "final"
        }
      },
      onDone: {
        target: "#itwProximityMachine.Presentment"
      }
    },
    Presentment: {
      description:
        "Manages the communication lifecycle between the device and the verifier",
      initial: "Starting",
      entry: "navigateToPresentmentScreen",
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
          target: "Presentment.DisplayQrCode",
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
          target: "Presentment.ClaimsDisclosure"
        },
        "device-disconnected": [
          {
            // This event is dispatched when the verifier sends the END (0x02) termination flag after sendDocuments.
            // At this point, the verification process is complete and we can navigate to the success state.
            guard: stateIn("Presentment.SendingDocuments"),
            target: "#itwProximityMachine.Success"
          },
          {
            // This event is dispatched when the verifier sends the END (0x02) termination flag before sendDocuments.
            // At this point, the verification process is NOT complete and we can safely close the proximity session.
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
          tags: [ItwPresentationTags.Loading],
          always: {
            target: "Starting",
            actions: assign(() => ({ failure: undefined }))
          }
        },
        Starting: {
          tags: [ItwPresentationTags.Loading],
          description: "Start the proximity and generates the QR code string",
          invoke: {
            src: "startEngagement",
            input: {
              engagementModes: ["qrcode"],
              retrievalMethods: ["ble"]
            },
            onDone: {},
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
        DisplayQrCode: {
          description:
            "Displays the QR code to initiate proximity communication",
          tags: [ItwPresentationTags.Presenting],
          on: {
            "start-nfc-presentment": {
              target: "#itwProximityMachine.Nfc"
            },
            close: {
              actions: "closeProximity"
            }
          }
        },
        Connecting: {
          description:
            "Initiates the connection between the device and the verifier",
          tags: [ItwPresentationTags.Loading],
          entry: "navigateToClaimsDisclosureScreen"
        },
        Connected: {
          description:
            "The device has successfully established a connection with the verifier",
          tags: [ItwPresentationTags.Loading]
        },
        ClaimsDisclosure: {
          description: "Displays the requested claims",
          on: {
            "holder-consent": {
              actions: "setHasGivenConsent",
              target: "#itwProximityMachine.Presentment.SendingDocuments"
            },
            back: {
              target: "#itwProximityMachine.Presentment.Terminating"
            }
          }
        },
        SendingDocuments: {
          description: "Sends the required documents to the verifier app",
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
              // There's not evidence of the verifier responding to this request.
              // We are waiting for the onDeviceDisconnected event.
            },
            onError: {
              actions: "setFailure",
              target: "#itwProximityMachine.Failure"
            }
          }
        },
        Terminating: {
          description: "Terminates the proximity session with the verifier",
          tags: [ItwPresentationTags.Loading],
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
        },
        Closing: {
          description: "Close the proximity presentation flow",
          tags: [ItwPresentationTags.Loading],
          invoke: {
            src: "closeProximityFlow",
            onDone: {
              actions: "closeProximity"
            },
            onError: {
              target: "#itwProximityMachine.Failure",
              actions: "setFailure"
            }
          }
        }
      }
    },
    Nfc: {
      tags: [ItwPresentationTags.Loading],
      description: "Perform all the checks related to NFC",
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
          entry: "navigateToNfcActivationScreen",
          description: "Display the screen prompting the user to enable NFC",
          on: {
            close: {
              target: "#itwProximityMachine.Presentment"
            },
            continue: {
              target: "Completed"
            }
          }
        },
        Completed: {
          description: "Nfc checks are completed",
          type: "final"
        }
      },
      onDone: {
        target: "#itwProximityMachine.NfcPresentment"
      }
    },
    NfcPresentment: {
      description:
        "Manages the NFC communication lifecycle between the device and the verifier",
      initial: "Starting",
      entry: "navigateToNfcPresentmentScreen",
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
        "device-connecting": {
          target: "NfcPresentment.Connecting"
        },
        "device-connected": {
          target: "NfcPresentment.Connected"
        },
        "device-document-request-received": {
          actions: assign(({ event }) => ({
            proximityDetails: event.proximityDetails,
            verifierRequest: event.verifierRequest
          })),
          target: "NfcPresentment.ClaimsDisclosure"
        },
        "device-disconnected": [
          {
            // This event is dispatched when the verifier sends the END (0x02) termination flag after sendDocuments.
            // At this point, the verification process is complete and we can navigate to the success state.
            guard: stateIn("NfcPresentment.SendingDocuments"),
            target: "#itwProximityMachine.Success"
          },
          {
            // This event is dispatched when the verifier sends the END (0x02) termination flag before sendDocuments.
            // At this point, the verification process is NOT complete and we can safely close the proximity session.
            actions: "setFailure",
            target: "NfcPresentment.Terminating"
          }
        ],
        "device-error": {
          actions: "setFailure",
          target: "NfcPresentment.Terminating"
        }
      },
      states: {
        Retrying: {
          tags: [ItwPresentationTags.Loading],
          always: {
            target: "Starting",
            actions: assign(() => ({ failure: undefined }))
          }
        },
        Starting: {
          tags: [ItwPresentationTags.Loading],
          description: "Start the proximity and generates the QR code string",
          invoke: {
            src: "startEngagement",
            input: {
              engagementModes: ["nfc"],
              retrievalMethods: ["nfc", "ble"]
            },
            onDone: {
              target: "AwaitingConnection"
            },
            onError: {
              actions: ["setFailure"]
            }
          },
          on: {
            "nfc-stopped": {
              target: "Terminating"
            },
            retry: {
              target: "Retrying"
            }
          }
        },
        AwaitingConnection: {
          description: "Waiting for the verifier to connect via NFC",
          tags: [ItwPresentationTags.Presenting]
        },
        Connecting: {
          tags: [ItwPresentationTags.Loading],
          description:
            "Initiates the connection between the device and the verifier"
        },
        Connected: {
          tags: [ItwPresentationTags.Loading],
          description:
            "The device has successfully established a connection with the verifier"
        },
        ClaimsDisclosure: {
          description: "Displays the requested claims",
          entry: "navigateToClaimsDisclosureScreen",
          on: {
            "holder-consent": {
              actions: "setHasGivenConsent",
              target: "#itwProximityMachine.NfcPresentment.SendingDocuments"
            },
            back: {
              target: "#itwProximityMachine.NfcPresentment.Terminating"
            }
          }
        },
        SendingDocuments: {
          description: "Sends the required documents to the verifier app",
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
              // There's not evidence of the verifier responding to this request.
              // We are waiting for the onDeviceDisconnected event.
            },
            onError: {
              actions: "setFailure",
              target: "#itwProximityMachine.Failure"
            }
          }
        },
        Terminating: {
          description: "Terminates the proximity session with the verifier",
          tags: [ItwPresentationTags.Loading],
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
        },
        Closing: {
          description: "Close the proximity presentation flow",
          tags: [ItwPresentationTags.Loading],
          invoke: {
            src: "closeProximityFlow",
            onDone: {
              actions: "closeProximity"
            },
            onError: {
              target: "#itwProximityMachine.Failure",
              actions: "setFailure"
            }
          }
        }
      }
    },
    Success: {
      description: "The documents have been successfully sent to the Verifier",
      // The loading tag is used to prevend glitches when navigating to the success screen
      tags: [ItwPresentationTags.Loading],
      always: {
        guard: not("isNfcRetrieval"),
        actions: "navigateToSuccessScreen"
      },
      on: {
        close: {
          actions: "navigateToWallet",
          target: "Idle"
        }
      }
    },
    Failure: {
      description: "This state is reached when an error occurs",
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
