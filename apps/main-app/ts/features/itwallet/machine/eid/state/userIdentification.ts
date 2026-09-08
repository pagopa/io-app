import { itwEidIssuanceMachineSetup } from "../setup";
import { cieIdState } from "./cieId";
import { ciePinState } from "./ciePin";
import { spidState } from "./spid";

/** Coordinates supported identification methods until primary authentication completes. */
export const userIdentificationState =
  itwEidIssuanceMachineSetup.createStateConfig({
    description:
      "User identification flow. Once we get the user token we can continue to the eID issuance",
    initial: "Identification",
    states: {
      Identification: {
        description: "Selection of the identification method",
        always: {
          actions: "navigateToIdentificationScreen"
        },
        on: {
          "select-identification-mode": [
            {
              guard: ({ event }) => event.mode === "spid",
              actions: "trackIdentificationMethodSelected",
              target: "#itwEidIssuanceMachine.UserIdentification.Spid"
            },
            {
              guard: ({ event }) => event.mode === "ciePin",
              actions: "trackIdentificationMethodSelected",
              target: "#itwEidIssuanceMachine.UserIdentification.CiePin"
            },
            {
              guard: ({ event }) => event.mode === "cieId",
              actions: [
                "trackIdentificationMethodSelected",
                "setCieIdIdentificationL2"
              ],
              target: "#itwEidIssuanceMachine.UserIdentification.CieID"
            }
          ],
          "go-to-cie-warning": {
            target:
              "#itwEidIssuanceMachine.UserIdentification.CiePin.CieWarning.Identification"
          },
          back: [
            {
              guard: "isReissuance",
              target: "#itwEidIssuanceMachine.Idle",
              actions: "closeIssuance"
            },
            {
              guard: "isL2Fallback",
              target: "#itwEidIssuanceMachine.Idle",
              actions: "navigateToTosScreen"
            },
            {
              guard: "isL3FeaturesEnabled",
              target: "#itwEidIssuanceMachine.TosAcceptance"
            },
            {
              target: "#itwEidIssuanceMachine.IpzsPrivacyAcceptance"
            }
          ],
          close: {
            target: "#itwEidIssuanceMachine.Idle",
            actions: "closeIssuance"
          }
        }
      },
      CieID: cieIdState,
      Spid: spidState,
      CiePin: ciePinState,
      Completed: {
        type: "final"
      }
    },
    onDone: [
      {
        guard: "requiresMrtdVerification",
        target: "MrtdPoP",
        actions: "trackItwIdAuthenticationCompleted"
      },
      {
        guard: ({ context }) =>
          context.identification?.mode === "cieId" &&
          context.identification.level === "L3",
        target: "Issuance",
        actions: "trackItwIdAuthenticationCompleted"
      },
      {
        target: "Issuance"
      }
    ]
  } as const);
