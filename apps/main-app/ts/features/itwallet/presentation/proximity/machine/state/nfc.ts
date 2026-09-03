import { assign } from "xstate";

import { itwProximityMachineSetup } from "../setup";

/** Resolves NFC activation when user selects NFC engagement. */
export const nfcState = itwProximityMachineSetup.createStateConfig({
  description: "NFC activation gate, entered only when the user opts in",
  initial: "CheckActivation",
  states: {
    CheckActivation: {
      description: "Check if NFC is enabled",
      invoke: {
        src: "checkNfcActivation",
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
      description: "Prompt the user to enable NFC",
      entry: "navigateToNfcActivationScreen",
      on: {
        close: {
          // Back to the QR engagement still in progress, without committing to NFC
          target: "#itwProximityMachine.Presentment"
        },
        continue: {
          target: "Completed"
        }
      }
    },
    Completed: {
      description: "NFC gate cleared",
      type: "final"
    }
  },
  onDone: {
    // External transition to Presentment fully restarts proximityCommunicationLogic
    // and startEngagement so the native session runs with the NFC configuration
    target: "#itwProximityMachine.Presentment",
    actions: [
      assign({ engagementMode: "nfc" }),
      "navigateToNfcPresentmentScreen",
      "trackProximityStart"
    ]
  }
} as const);
