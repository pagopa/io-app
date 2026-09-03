import { itwEidIssuanceMachineSetup } from "../setup";

/** Routes CIE warning dismissal back to its originating identification step. */
export const cieWarningState = itwEidIssuanceMachineSetup.createStateConfig({
  description: "Navigates to and handles the CIE warning screen.",
  entry: "navigateToCieWarningScreen",
  initial: "Identification",
  states: {
    Identification: {
      on: {
        back: "#itwEidIssuanceMachine.UserIdentification.Identification",
        close: {
          target: "#itwEidIssuanceMachine.Idle",
          actions: "closeIssuance"
        }
      }
    },
    PreparationCie: {
      on: {
        back: "#itwEidIssuanceMachine.UserIdentification.CiePin.PreparationCie"
      }
    },
    PreparationPin: {
      on: {
        back: "#itwEidIssuanceMachine.UserIdentification.CiePin.PreparationPin"
      }
    }
  },
  on: {
    close: {
      actions: "closeIssuance"
    }
  }
} as const);
