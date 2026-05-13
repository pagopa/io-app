import { assign, fromCallback, fromPromise, setup, stateIn } from "xstate";
import {
  SendErrorResponseActorOutput,
  SendDocumentsActorInput,
  SendDocumentsActorOutput,
  CloseActorOutput,
  ProximityCommunicationLogicInput
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
    navigateToQrCodeScreen: notImplemented,
    navigateToFailureScreen: notImplemented,
    navigateToClaimsDisclosureScreen: notImplemented,
    navigateToSendDocumentsResponseScreen: notImplemented,
    navigateToWallet: notImplemented,
    closeProximity: notImplemented,

    /**
     * Analytics
     */

    trackQrCodeGenerationOutcome: notImplemented
  },
  actors: {
    checkBluetoothPermissions: fromPromise<boolean>(notImplemented),
    checkBluetoothActivation: fromPromise<boolean>(notImplemented),
    checkNfcActivation: fromPromise<boolean>(notImplemented),
    proximityCommunicationLogic: fromCallback<
      ProximityEvents,
      ProximityCommunicationLogicInput
    >(notImplemented),
    startEngagement: fromPromise<void>(notImplemented),
    sendDocuments: fromPromise<
      SendDocumentsActorOutput,
      SendDocumentsActorInput
    >(notImplemented),
    terminateProximitySession:
      fromPromise<SendErrorResponseActorOutput>(notImplemented),
    closeProximityFlow: fromPromise<CloseActorOutput, void>(notImplemented)
  },
  guards: {
    hasFailure: ({ context }) => !!context.failure
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
        target: "#itwProximityMachine.Nfc"
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
                target: "#itwProximityMachine.Presentation"
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
              actions: "closeProximity"
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
        target: "#itwProximityMachine.Presentation"
      }
    },
    Presentation: {
      description:
        "Manages the communication lifecycle between the device and the verifier",
      initial: "Starting",
      entry: "navigateToQrCodeScreen",
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
          target: "Presentation.DisplayQrCode",
          actions: assign(({ event }) => ({
            qrCodeString: event.payload
          }))
        },
        "device-connecting": {
          target: "Presentation.Connecting"
        },
        "device-connected": {
          target: "Presentation.Connected"
        },
        "device-document-request-received": {
          actions: assign(({ event }) => ({
            proximityDetails: event.proximityDetails,
            verifierRequest: event.verifierRequest
          })),
          target: "Presentation.ClaimsDisclosure"
        },
        "device-disconnected": [
          {
            // This event is dispatched when the verifier sends the END (0x02) termination flag after sendDocuments.
            // At this point, the verification process is complete and we can navigate to the success state.
            guard: stateIn("Presentation.SendingDocuments"),
            target: "#itwProximityMachine.Success"
          },
          {
            // This event is dispatched when the verifier sends the END (0x02) termination flag before sendDocuments.
            // At this point, the verification process is NOT complete and we can safely close the proximity session.
            actions: "setFailure",
            target: "Presentation.Terminating"
          }
        ],
        "device-error": {
          actions: "setFailure",
          target: "Presentation.Terminating"
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
            onDone: {
              actions: "trackQrCodeGenerationOutcome"
            },
            onError: {
              actions: ["setFailure", "trackQrCodeGenerationOutcome"]
            }
          },
          on: {
            retry: {
              target: "Retrying"
            }
          }
        },
        DisplayQrCode: {
          tags: [ItwPresentationTags.Presenting],
          description:
            "Displays the QR code to initiate proximity communication",
          on: {
            close: {
              actions: "closeProximity"
            }
          }
        },
        Connecting: {
          description:
            "Initiates the connection between the device and the verifier"
        },
        Connected: {
          entry: "navigateToClaimsDisclosureScreen",
          description:
            "The device has successfully established a connection with the verifier"
        },
        ClaimsDisclosure: {
          description: "Displays the requested claims",
          on: {
            "holder-consent": {
              actions: "setHasGivenConsent",
              target: "#itwProximityMachine.Presentation.SendingDocuments"
            },
            back: {
              target: "#itwProximityMachine.Presentation.Terminating"
            }
          }
        },
        SendingDocuments: {
          initial: "Initial",
          description: "Sends the required documents to the verifier app",
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
          },
          states: {
            Initial: {
              entry: "navigateToSendDocumentsResponseScreen",
              description: "Initial loading state",
              after: {
                5000: {
                  target:
                    "#itwProximityMachine.Presentation.SendingDocuments.Reminder"
                }
              }
            },
            Reminder: {
              description: "Loading state when the process is taking too long",
              after: {
                10000: {
                  target:
                    "#itwProximityMachine.Presentation.SendingDocuments.Final"
                }
              }
            },
            Final: {
              description: "Final loading state"
            }
          }
        },
        Terminating: {
          description: "Terminates the proximity session with the verifier",
          invoke: {
            id: "terminateProximitySession",
            src: "terminateProximitySession",
            onDone: [
              {
                guard: "hasFailure",
                target: "#itwProximityMachine.Failure"
              },
              {
                actions: "closeProximity",
                target: "#itwProximityMachine.Idle"
              }
            ],
            onError: [
              {
                guard: "hasFailure",
                target: "#itwProximityMachine.Failure"
              },
              {
                actions: "closeProximity",
                target: "#itwProximityMachine.Idle"
              }
            ]
          }
        },
        Closing: {
          description: "Close the proximity presentation flow",
          invoke: {
            src: "closeProximityFlow",
            onDone: {
              target: "#itwProximityMachine.Idle"
            },
            onError: {
              target: "#itwProximityMachine.Failure",
              actions: "setFailure"
            }
          }
        }
      }
    },
    // TODO add consents flow
    Success: {
      description: "The documents have been successfully sent to the Verifier",
      on: {
        close: {
          actions: "navigateToWallet",
          target: "Idle"
        }
      }
    },
    Failure: {
      entry: "navigateToFailureScreen",
      description: "This state is reached when an error occurs",
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
