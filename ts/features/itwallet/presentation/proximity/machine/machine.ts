import { assign, fromCallback, fromPromise, setup } from "xstate";
import { InitialContext, Context } from "./context";
import { RemoteEvents } from "./events";
import { ItwPresentationTags } from "./tags";

const notImplemented = () => {
  throw new Error("Not implemented");
};

export const itwProximityMachine = setup({
  types: {
    context: {} as Context,
    events: {} as RemoteEvents
  },
  actions: {
    navigateToGrantPermissionsScreen: notImplemented,
    navigateToBluetoothActivationScreen: notImplemented,
    closePresentation: notImplemented
  },
  actors: {
    checkPermissions: fromPromise<boolean, void>(notImplemented),
    checkBluetoothIsActive: fromPromise<boolean, void>(notImplemented),
    startFlow: fromPromise<void, void>(notImplemented),
    generateQRCodeString: fromPromise<string, void>(notImplemented),
    closeFlow: fromCallback(notImplemented)
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
          target: "CheckingPermissions"
        }
      }
    },
    CheckingPermissions: {
      tags: [ItwPresentationTags.Loading],
      description: "Check if the device permissions have been granted",
      invoke: {
        src: "checkPermissions",
        onDone: [
          {
            guard: ({ event }) => !!event.output,
            target: "CheckingBluetoothIsActive"
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
          target: "Idle"
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
            target: "CheckingBluetoothIsActive"
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
          target: "Idle"
        }
      }
    },
    CheckingBluetoothIsActive: {
      tags: [ItwPresentationTags.Loading],
      description: "Check if Bluetooth is enabled",
      invoke: {
        src: "checkBluetoothIsActive",
        onDone: [
          {
            guard: ({ event }) => !!event.output,
            target: "StartingProximityFlow"
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
      description: "Display the screen prompting the user to enable Bluetooth",
      on: {
        back: {
          target: "Idle"
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
            target: "StartingProximityFlow"
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
          target: "Idle"
        }
      }
    },
    StartingProximityFlow: {
      tags: [ItwPresentationTags.Loading],
      description: "Start the Proximity flow",
      invoke: {
        src: "startFlow",
        onDone: {
          target: "GeneratingQRCodeString"
        },
        onError: {
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
          actions: assign(({ event }) => ({ qrCodeString: event.output })),
          target: "DisplayQRCode"
        },
        onError: {
          target: "QRCodeGenerationError"
        }
      }
    },
    DisplayQRCode: {
      description: "Display the QR Code",
      on: {
        close: {
          target: "ClosePresentation"
        }
      }
    },
    QRCodeGenerationError: {
      description: "Display the QR code generation error",
      on: {
        close: {
          target: "ClosePresentation"
        }
      }
    },
    ClosePresentation: {
      tags: [ItwPresentationTags.Loading],
      description: "Close the proximity presentation flow",
      invoke: {
        src: "closeFlow"
      },
      on: {
        close: {
          target: "Idle"
        }
      }
    }
  }
});

export type ItwProximityMachine = typeof itwProximityMachine;
