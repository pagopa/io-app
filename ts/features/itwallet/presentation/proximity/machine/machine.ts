import { fromPromise, setup } from "xstate";
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
    navigateToBluetoothConsentScreen: notImplemented,
    navigateToBluetoothActivationScreen: notImplemented,
    generateQRCode: notImplemented,
    closePresentation: notImplemented
  },
  actors: {
    checkPermissions: fromPromise<Promise<boolean>, void>(notImplemented),
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
        onDone: {
          target: "CheckingBluetoothIsActive"
        },
        onError: {
          target: "GrantPermissions"
        }
      }
    },
    GrantPermissions: {
      entry: "navigateToBluetoothConsentScreen",
      on: {
        back: {
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
