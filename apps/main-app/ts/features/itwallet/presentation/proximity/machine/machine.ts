import { not } from "xstate";

import { InitialContext } from "./context";
import { itwProximityMachineSetup } from "./setup";
import { bluetoothState } from "./state/bluetooth";
import { nfcState } from "./state/nfc";
import { presentmentState } from "./state/presentment";

export const itwProximityMachine = itwProximityMachineSetup.createMachine({
  id: "itwProximityMachine",
  context: { ...InitialContext },
  initial: "Idle",
  entry: "onInit",
  states: {
    Idle: {
      description: "Initial state, awaiting the start of the flow",
      on: {
        start: {
          target: "Bluetooth"
        }
      }
    },
    Bluetooth: bluetoothState,
    Nfc: nfcState,
    Presentment: presentmentState,
    Success: {
      description: "Documents successfully sent to the verifier",
      always: {
        // NFC retrieval renders success inline on its own screen, no navigation needed
        guard: not("isNfcRetrieval"),
        actions: "navigateToSuccessScreen"
      },
      on: {
        close: {
          actions: "closeProximity",
          target: "Idle"
        }
      }
    },
    Failure: {
      description: "An error occurred, captured in context.failure",
      entry: "navigateToFailureScreen",
      initial: "EnsureTerminated",
      states: {
        EnsureTerminated: {
          always: [
            {
              // NFC consent teardown already sent SESSION_TERMINATED.
              // A second native sendErrorResponse can resume the same continuation twice.
              guard: "hasTerminatedSession",
              target: "Idle"
            },
            {
              target: "Terminating"
            }
          ]
        },
        Terminating: {
          invoke: {
            id: "terminateSession",
            src: "terminateSession",
            onDone: {
              actions: "markSessionTerminated",
              target: "Idle"
            },
            onError: {
              actions: "markSessionTerminated",
              target: "Idle"
            }
          }
        },
        Idle: {
          description: "Termination attempted or skipped for this engagement"
        }
      },
      on: {
        close: {
          actions: "closeProximity",
          target: "#itwProximityMachine.Idle"
        }
      }
    }
  }
});

export type ItwProximityMachine = typeof itwProximityMachine;
