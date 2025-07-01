import { assign, fromCallback, fromPromise, setup } from "xstate";
import { InitialContext, Context } from "./context";
import { ProximityEvents } from "./events";
import { ItwPresentationTags } from "./tags";
import {
  SendErrorResponseActorOutput,
  ProximityCommunicationLogicActorInput,
  SendDocumentsActorInput,
  SendDocumentsActorOutput,
  StartProximityFlowInput
} from "./actors";
import { mapEventToFailure } from "./failure";

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
    setFailure: assign(({ event }) => ({ failure: mapEventToFailure(event) })),
    setQRCodeGenerationError: assign({ isQRCodeGenerationError: true }),
    navigateToGrantPermissionsScreen: notImplemented,
    navigateToBluetoothActivationScreen: notImplemented,
    navigateToFailureScreen: notImplemented,
    navigateToClaimsDisclosureScreen: notImplemented,
    navigateToSendDocumentsResponseScreen: notImplemented,
    navigateToWallet: notImplemented,
    closeProximity: notImplemented
  },
  actors: {
    checkPermissions: fromPromise<boolean, void>(notImplemented),
    checkBluetoothIsActive: fromPromise<boolean, void>(notImplemented),
    startProximityFlow: fromPromise<void, StartProximityFlowInput>(
      notImplemented
    ),
    generateQrCodeString: fromPromise<string, void>(notImplemented),
    closeProximityFlow: fromPromise<boolean, void>(notImplemented),
    proximityCommunicationLogic: fromCallback<
      ProximityEvents,
      ProximityCommunicationLogicActorInput
    >(notImplemented),
    terminateProximitySession:
      fromPromise<SendErrorResponseActorOutput>(notImplemented),
    sendDocuments: fromPromise<
      SendDocumentsActorOutput,
      SendDocumentsActorInput
    >(notImplemented)
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
              actions: "setQRCodeGenerationError",
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
              actions: assign(({ event }) => ({
                qrCodeString: event.output,
                isQRCodeGenerationError: false
              })),
              target: "#itwProximityMachine.DeviceCommunication"
            },
            onError: {
              actions: "setQRCodeGenerationError",
              target: "QRCodeGenerationError"
            }
          }
        },
        QRCodeGenerationError: {
          tags: [ItwPresentationTags.Presenting],
          description: "Display the QR code generation error",
          on: {
            close: {
              target: "#itwProximityMachine.ClosePresentation"
            },
            retry: {
              target: "RestartingProximityFlow"
            }
          }
        },
        RestartingProximityFlow: {
          tags: [ItwPresentationTags.Loading],
          description: "Restart the proximity flow",
          invoke: {
            src: "startProximityFlow",
            input: { isRestarting: true },
            onDone: {
              target: "GeneratingQRCodeString"
            },
            onError: {
              actions: "setQRCodeGenerationError",
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
        input: ({ context }) => ({
          credentialsByType: context.credentialsByType
        })
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
        "device-error": {
          actions: "setFailure",
          target: "Failure"
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
          entry: "navigateToClaimsDisclosureScreen",
          description:
            "Initiates the connection between the device and the verifier"
        },
        Connected: {
          description:
            "The device has successfully established a connection with the verifier"
        },
        ClaimsDisclosure: {
          description: "Displays the requested claims",
          on: {
            "holder-consent": {
              target:
                "#itwProximityMachine.DeviceCommunication.SendingDocuments"
            },
            back: {
              target: "#itwProximityMachine.DeviceCommunication.Closing"
            }
          }
        },
        SendingDocuments: {
          tags: [ItwPresentationTags.Loading],
          entry: "navigateToSendDocumentsResponseScreen",
          description: "Sends the required documents to the verifier app",
          invoke: {
            id: "sendDocuments",
            src: "sendDocuments",
            input: ({ context }) => ({
              credentialsByType: context.credentialsByType,
              verifiedRequest: context.verifierRequest
            }),
            onDone: {
              target: "#itwProximityMachine.Success"
            },
            onError: {
              actions: "setFailure",
              target: "#itwProximityMachine.Failure"
            }
          }
        },
        Closing: {
          description: "Terminates the proximity session with the verifier",
          invoke: {
            id: "terminateProximitySession",
            src: "terminateProximitySession",
            onDone: {
              actions: "closeProximity",
              target: "#itwProximityMachine.Idle"
            },
            onError: {
              actions: "closeProximity",
              target: "#itwProximityMachine.Idle"
            }
          }
        }
      }
    },
    Success: {
      description: "The documents have been successfully sent to the Verifier",
      on: {
        close: {
          actions: "navigateToWallet"
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
