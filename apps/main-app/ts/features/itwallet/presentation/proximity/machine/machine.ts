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
      invoke: {
        id: "terminateSession",
        src: "terminateSession",
        onDone: {
          // Attempt termination ignoring result
        },
        onError: {
          // Attempt termination ignoring any failure
        }
      },
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
