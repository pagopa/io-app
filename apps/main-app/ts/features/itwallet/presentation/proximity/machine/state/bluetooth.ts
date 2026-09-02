import { itwProximityMachineSetup } from "../setup";
import { ItwPresentationTags } from "../tags";

/** Resolves Bluetooth permission and activation prerequisites before presentation. */
export const bluetoothState = itwProximityMachineSetup.createStateConfig({
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
    target: "#itwProximityMachine.Presentment",
    actions: ["navigateToPresentmentScreen", "trackProximityStart"]
  }
} as const);
