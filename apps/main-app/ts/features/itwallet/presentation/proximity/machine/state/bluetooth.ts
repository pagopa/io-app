import { itwProximityMachineSetup } from "../setup";
import { ItwPresentationTags } from "../tags";

/**
 * Resolves Bluetooth permission and activation prerequisites before
 * presentation.
 */
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
        },
        back: {
          target: "RecheckPermissions"
        }
      }
    },
    RecheckPermissions: {
      description:
        "On back, continue if the permissions were granted from settings, otherwise close the flow",
      invoke: {
        src: "verifyBluetoothPermissions",
        onDone: [
          {
            guard: ({ event }) => event.output,
            target: "CheckActivation"
          },
          {
            actions: ["trackBluetoothAccessClose", "closeProximity"],
            target: "#itwProximityMachine.Idle"
          }
        ],
        onError: {
          actions: ["trackBluetoothAccessClose", "closeProximity"],
          target: "#itwProximityMachine.Idle"
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
        },
        back: {
          target: "RecheckActivation"
        }
      }
    },
    RecheckActivation: {
      description:
        "On back, continue if Bluetooth was enabled from settings, otherwise close the flow",
      invoke: {
        src: "checkBluetoothActivation",
        onDone: [
          {
            guard: ({ event }) => event.output,
            target: "Completed"
          },
          {
            actions: ["trackBluetoothActivationClose", "closeProximity"],
            target: "#itwProximityMachine.Idle"
          }
        ],
        onError: {
          actions: ["trackBluetoothActivationClose", "closeProximity"],
          target: "#itwProximityMachine.Idle"
        }
      }
    },
    Completed: {
      description: "Bluetooth gate cleared",
      type: "final"
    }
  },
  onDone: [
    {
      guard: "isNfcEngagement",
      target: "#itwProximityMachine.Presentment"
    },
    {
      target: "#itwProximityMachine.Presentment",
      actions: "navigateToPresentmentScreen"
    }
  ]
} as const);
