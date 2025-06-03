import { assign, fromPromise, setup } from "xstate";
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
    navigateToMDLScreen: notImplemented,
    generateQRCode: notImplemented,
    closePresentation: notImplemented
  },
  actors: {
    checkPermissions: fromPromise<boolean, void>(notImplemented),
    checkBluetoothIsActive: fromPromise(notImplemented)
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
      description: "",
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
      invoke: {
        src: "checkPermissions",
        onDone: [
          {
            guard: ({ event }) => !!event.output,
            target: "CheckingBluetoothIsActive"
          },
          {
            guard: ({ event }) => !event.output,
            actions: "navigateToMDLScreen",
            target: "PermissionsRequired"
          }
        ],
        onError: {
          target: "PermissionsRequired"
        }
      }
    },
    PermissionsRequired: {
      on: {
        close: {
          target: "Idle"
        }
      }
    },
    CheckingBluetoothIsActive: {
      tags: [ItwPresentationTags.Loading],
      description: "",
      invoke: {
        src: "checkBluetoothIsActive",
        onDone: {
          target: "GeneratingQRCode"
        },
        onError: {
          target: "GrantPermissions" // TODO: Change this target
        }
      }
    },
    GeneratingQRCode: {}
  }
});

export type ItwProximityMachine = typeof itwProximityMachine;
