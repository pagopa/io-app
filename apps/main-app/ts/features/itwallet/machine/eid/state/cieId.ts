import { assign } from "xstate";

import { itwEidIssuanceMachineSetup } from "../setup";

/** Handles CieID authentication through redirect completion. */
export const cieIdState = itwEidIssuanceMachineSetup.createStateConfig({
  description: "This state handles the entire CieID authentication flow",
  initial: "StartingCieIDAuthFlow",
  states: {
    StartingCieIDAuthFlow: {
      entry: [
        assign(() => ({ authenticationContext: undefined })),
        "navigateToCieIdLoginScreen"
      ],
      invoke: {
        src: "startAuthFlow",
        input: ({ context }) => ({
          itwVersion: context.itwVersion,
          walletInstanceAttestation: context.walletInstanceAttestation?.jwt,
          identification: context.identification,
          withMRTDPoP: context.level === "l3"
        }),
        onDone: {
          actions: assign(({ event }) => ({
            authenticationContext: event.output
          })),
          target: "CompletingCieIDAuthFlow"
        },
        onError: [
          {
            actions: "setFailure",
            target: "#itwEidIssuanceMachine.Failure"
          }
        ]
      }
    },
    CompletingCieIDAuthFlow: {
      on: {
        "user-identification-completed": {
          target: "Completed",
          actions: [
            "completeUserIdentification",
            "updateCieIdIdentificationLevel",
            "storeAuthLevel"
          ]
        },
        error: {
          actions: "setFailure",
          target: "#itwEidIssuanceMachine.Failure"
        }
      }
    },
    Completed: {
      type: "final"
    }
  },
  on: {
    back: {
      target: "#itwEidIssuanceMachine.UserIdentification.Identification"
    }
  },
  onDone: {
    target: "#itwEidIssuanceMachine.UserIdentification.Completed"
  }
} as const);
