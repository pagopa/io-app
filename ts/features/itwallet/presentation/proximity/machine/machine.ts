import { assign, fromCallback, fromPromise, setup, stateIn } from "xstate";
import { assert } from "../../../../../utils/assert";
import {
  CheckPermissionsInput,
  CloseActorOutput,
  GetQrCodeStringActorOutput,
  ProximityCommunicationLogicInput,
  SendDocumentsActorInput,
  SendDocumentsActorOutput,
  SendErrorResponseActorOutput,
  StartProximityFlowInput
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
    setQRCodeGenerationError: assign({ isQRCodeGenerationError: true }),
    setHasGivenConsent: assign({ hasGivenConsent: true }),

    /**
     * Navigation
     */

    navigateToGrantPermissionsScreen: notImplemented,
    navigateToBluetoothActivationScreen: notImplemented,
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
    checkPermissions: fromPromise<boolean, CheckPermissionsInput>(
      notImplemented
    ),
    checkBluetoothIsActive: fromPromise<boolean, void>(notImplemented),
    startProximityFlow: fromPromise<void, StartProximityFlowInput>(
      notImplemented
    ),
    generateQrCodeString: fromPromise<GetQrCodeStringActorOutput, void>(
      notImplemented
    ),
    closeProximityFlow: fromPromise<CloseActorOutput, void>(notImplemented),
    proximityCommunicationLogic: fromCallback<
      ProximityEvents,
      ProximityCommunicationLogicInput
    >(notImplemented),
    terminateProximitySession:
      fromPromise<SendErrorResponseActorOutput>(notImplemented),
    sendDocuments: fromPromise<
      SendDocumentsActorOutput,
      SendDocumentsActorInput
    >(notImplemented)
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
          actions: assign(({ event }) => ({
            ...InitialContext,
            credentialType: event.credentialType
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
            input: { isSilent: false },
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
            "Display the screen prompting the user to grant device permissions",
          on: {
            back: {
              target: "#itwProximityMachine.Idle"
            },
            continue: {
              target: "CheckPermissionsSilently"
            }
          }
        },
        CheckPermissionsSilently: {
          tags: [ItwPresentationTags.Loading],
          description: "Check if the device permissions have been granted",
          invoke: {
            src: "checkPermissions",
            input: { isSilent: true },
            onDone: [
              {
                guard: ({ event }) => !!event.output,
                target: "#itwProximityMachine.Bluetooth"
              },
              {
                guard: ({ event }) => !event.output,
                target: "PermissionsRequired"
              }
            ],
            onError: {
              target: "PermissionsRequired"
            }
          }
        },
        PermissionsRequired: {
          description:
            "Display the system alert informing the user that permissions must be granted to proceed",
          on: {
            close: {
              target: "#itwProximityMachine.Idle"
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
                target: "#itwProximityMachine.GenerateQRCode"
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
            "Display the screen prompting the user to enable Bluetooth",
          on: {
            back: {
              target: "#itwProximityMachine.Idle"
            },
            continue: {
              target: "CheckingBluetoothIsActiveSilently"
            }
          }
        },
        CheckingBluetoothIsActiveSilently: {
          tags: [ItwPresentationTags.Loading],
          description: "Check if Bluetooth is enabled",
          invoke: {
            src: "checkBluetoothIsActive",
            onDone: [
              {
                guard: ({ event }) => !!event.output,
                target: "#itwProximityMachine.GenerateQRCode"
              },
              {
                guard: ({ event }) => !event.output,
                target: "BluetoothRequired"
              }
            ],
            onError: {
              target: "BluetoothRequired"
            }
          }
        },
        BluetoothRequired: {
          description:
            "Display the system alert informing the user that must enable the Bluetooth to proceed",
          on: {
            close: {
              target: "#itwProximityMachine.Idle"
            }
          }
        }
      }
    },
    GenerateQRCode: {
      initial: "StartingProximityFlow",
      description: "Start the proximity and generates the QR code string",
      states: {
        StartingProximityFlow: {
          tags: [ItwPresentationTags.Loading],
          description: "Start the Proximity flow",
          invoke: {
            src: "startProximityFlow",
            onDone: {
              target: "GeneratingQRCodeString"
            },
            onError: {
              actions: [
                "setQRCodeGenerationError",
                "trackQrCodeGenerationOutcome"
              ],
              target: "QRCodeGenerationError"
            }
          }
        },
        GeneratingQRCodeString: {
          tags: [ItwPresentationTags.Loading],
          description: "Generate the QR string",
          invoke: {
            src: "generateQrCodeString",
            onDone: {
              actions: [
                assign(({ event }) => ({
                  qrCodeString: event.output,
                  isQRCodeGenerationError: false
                })),
                "trackQrCodeGenerationOutcome"
              ],
              target: "#itwProximityMachine.DeviceCommunication"
            },
            onError: {
              actions: [
                "setQRCodeGenerationError",
                "trackQrCodeGenerationOutcome"
              ],
              target: "QRCodeGenerationError"
            }
          }
        },
        QRCodeGenerationError: {
          tags: [ItwPresentationTags.Presenting],
          description: "Display the QR code generation error",
          on: {
            dismiss: {
              target: "#itwProximityMachine.ClosePresentation"
            },
            retry: {
              target: "RestartingProximityFlow"
            }
          }
        },
        RestartingProximityFlow: {
          tags: [ItwPresentationTags.Presenting, ItwPresentationTags.Loading],
          description: "Restart the proximity flow",
          invoke: {
            src: "startProximityFlow",
            input: { isRestarting: true },
            onDone: {
              target: "GeneratingQRCodeString"
            },
            onError: {
              actions: [
                "setQRCodeGenerationError",
                "trackQrCodeGenerationOutcome"
              ],
              target: "QRCodeGenerationError"
            }
          }
        }
      }
    },
    ClosePresentation: {
      description: "Close the proximity presentation flow",
      invoke: {
        src: "closeProximityFlow",
        onDone: {
          target: "Idle"
        },
        onError: {
          // TODO: Handle any potential error scenario.
        }
      }
    },
    DeviceCommunication: {
      initial: "DisplayQrCode",
      description:
        "Manages the communication lifecycle between the device and the verifier",
      invoke: {
        id: "proximityCommunicationLogic",
        src: "proximityCommunicationLogic",
        input: ({ context }) => {
          assert(context.credentials, "Missing credentials");
          return {
            credentials: context.credentials
          };
        }
      },
      on: {
        "device-connecting": {
          target: "DeviceCommunication.Connecting"
        },
        "device-connected": {
          target: "DeviceCommunication.Connected"
        },
        "device-document-request-received": {
          actions: assign(({ event }) => ({
            proximityDetails: event.proximityDetails,
            verifierRequest: event.verifierRequest
          })),
          target: "DeviceCommunication.ClaimsDisclosure"
        },
        "device-disconnected": [
          {
            // This event is dispatched when the verifier sends the END (0x02) termination flag after sendDocuments.
            // At this point, the verification process is complete and we can navigate to the success state.
            guard: stateIn("DeviceCommunication.SendingDocuments"),
            target: "#itwProximityMachine.Success"
          },
          {
            // This event is dispatched when the verifier sends the END (0x02) termination flag before sendDocuments.
            // At this point, the verification process is NOT complete and we can safely close the proximity session.
            actions: "setFailure",
            target: "DeviceCommunication.Closing"
          }
        ],
        "device-error": {
          actions: "setFailure",
          target: "DeviceCommunication.Closing"
        }
      },
      states: {
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
              target:
                "#itwProximityMachine.DeviceCommunication.SendingDocuments"
            },
            back: {
              target: "#itwProximityMachine.DeviceCommunication.Closing"
            }
          }
        },
        SendingDocuments: {
          initial: "Initial",
          description: "Sends the required documents to the verifier app",
          invoke: {
            id: "sendDocuments",
            src: "sendDocuments",
            input: ({ context }) => {
              assert(
                context.walletInstanceAttestation,
                "Missing walletInstanceAttestation"
              );
              assert(context.credentials, "Missing credentials");
              assert(context.verifierRequest, "Missing verifierRequest");

              return {
                walletInstanceAttestation: context.walletInstanceAttestation,
                credentials: context.credentials,
                verifierRequest: context.verifierRequest
              };
            },
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
                    "#itwProximityMachine.DeviceCommunication.SendingDocuments.Reminder"
                }
              }
            },
            Reminder: {
              description: "Loading state when the process is taking too long",
              after: {
                10000: {
                  target:
                    "#itwProximityMachine.DeviceCommunication.SendingDocuments.Final"
                }
              }
            },
            Final: {
              description: "Final loading state"
            }
          }
        },
        Closing: {
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
