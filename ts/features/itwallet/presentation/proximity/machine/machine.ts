import { assign, fromPromise, setup } from "xstate";
import { InitialContext, Context } from "./context";
import { RemoteEvents } from "./events";
import { ItwPresentationTags } from "./tags";
import { StartProximityFlowInput } from "./actors";

const notImplemented = () => {
  throw new Error("Not implemented");
};

export const itwProximityMachine = setup({
  types: {
    context: {} as Context,
    events: {} as RemoteEvents
  },
  actions: {
    setQRCodeGenerationError: assign({ isQRCodeGenerationError: true }),
    navigateToGrantPermissionsScreen: notImplemented,
    navigateToBluetoothActivationScreen: notImplemented,
    closePresentation: notImplemented
  },
  actors: {
    checkPermissions: fromPromise<boolean, void>(notImplemented),
    checkBluetoothIsActive: fromPromise<boolean, void>(notImplemented),
    startProximityFlow: fromPromise<void, StartProximityFlowInput>(
      notImplemented
    ),
    generateQRCodeString: fromPromise<string, void>(notImplemented),
    closeProximityFlow: fromPromise<boolean, void>(notImplemented)
  }
}).createMachine({
  id: "itwProximityMachine",
  context: { ...InitialContext },
  initial: "Idle",
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
            src: "generateQRCodeString",
            onDone: {
              actions: assign(({ event }) => ({
                qrCodeString: event.output,
                isQRCodeGenerationError: false
              })),
              target: "#itwProximityMachine.DisplayQRCode"
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
    DisplayQRCode: {
      tags: [ItwPresentationTags.Presenting],
      description: "Display the QR Code",
      on: {
        close: {
          target: "ClosePresentation"
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
    }
  }
});

export type ItwProximityMachine = typeof itwProximityMachine;
