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

    navigateToGrantPermissionsScreen: notImplemented,
    navigateToBluetoothActivationScreen: notImplemented,
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
    checkPermissions: fromPromise<boolean, void>(notImplemented),
    checkBluetoothIsActive: fromPromise<boolean, void>(notImplemented),
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
    hasFailure: notImplemented
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
          target: "Permissions"
        }
      }
    },
    Permissions: {
      initial: "CheckingPermissions",
      description: "Perform all the checks related to the device permissions",
      states: {
        CheckingPermissions: {
          tags: [ItwPresentationTags.Loading],
          description: "Check if the device permissions have been granted",
          invoke: {
            src: "checkPermissions",
            onDone: [
              {
                guard: ({ event }) => !!event.output,
                target: "#itwProximityMachine.Bluetooth"
              },
              {
                guard: ({ event }) => !event.output,
                target: "GrantPermissions"
              }
            ],
            onError: {
              target: "GrantPermissions"
            }
          }
        },
        GrantPermissions: {
          entry: "navigateToGrantPermissionsScreen",
          description:
            "Display the screen prompting the user to grant device permissions. " +
            "The screen re-checks the permissions on Continue and only emits the event when granted.",
          on: {
            back: {
              actions: "closeProximity",
              target: "#itwProximityMachine.Idle"
            },
            continue: {
              target: "#itwProximityMachine.Bluetooth"
            }
          }
        }
      }
    },
    Bluetooth: {
      initial: "CheckingBluetoothIsActive",
      description: "Perform all the checks related to Bluetooth",
      states: {
        CheckingBluetoothIsActive: {
          tags: [ItwPresentationTags.Loading],
          description: "Check if Bluetooth is enabled",
          invoke: {
            src: "checkBluetoothIsActive",
            onDone: [
              {
                guard: ({ event }) => !!event.output,
                target: "#itwProximityMachine.Presentation"
              },
              {
                guard: ({ event }) => !event.output,
                target: "EnableBluetooth"
              }
            ],
            onError: {
              target: "EnableBluetooth"
            }
          }
        },
        EnableBluetooth: {
          entry: "navigateToBluetoothActivationScreen",
          description:
            "Display the screen prompting the user to enable Bluetooth. " +
            "The screen re-checks the Bluetooth status on Continue and only emits the event when enabled.",
          on: {
            back: {
              actions: "closeProximity",
              target: "#itwProximityMachine.Idle"
            },
            continue: {
              target: "#itwProximityMachine.Presentation"
            }
          }
        }
      }
    },
    Presentation: {
      initial: "Starting",
      // The QR code screen is the entry point of the proximity stack and may
      // be covered by the GrantPermissions / EnableBluetooth screens. When we
      // enter the Presentation state we always navigate back to it so the
      // generated QR code is displayed.
      entry: "navigateToQrCodeScreen",
      description:
        "Manages the communication lifecycle between the device and the verifier",
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
            dismiss: {
              target: "#itwProximityMachine.Idle"
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
