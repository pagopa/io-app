import _ from "lodash";
import { assign } from "xstate";

import { ItwTags } from "../../tags";
import { itwEidIssuanceMachineSetup } from "../setup";
import { cieWarningState } from "./cieWarning";

/** Handles CIE PIN entry, NFC activation, and card authentication. */
export const ciePinState = itwEidIssuanceMachineSetup.createStateConfig({
  description: "This state handles the entire CIE + pin identification flow",
  initial: "PreparationPin",
  states: {
    PreparationPin: {
      description:
        "This state handles the CIE PIN preparation screen, where the user is informed about the CIE PIN",
      entry: "navigateToCiePinPreparationScreen",
      on: {
        next: [
          {
            guard: "isNFCEnabled",
            target: "InsertingCardPin"
          },
          {
            target: "RequestingNfcActivation"
          }
        ],
        "go-to-cie-warning": {
          target: "CieWarning.PreparationPin"
        },
        back: {
          target: "#itwEidIssuanceMachine.UserIdentification"
        },
        close: {
          actions: "closeIssuance"
        }
      }
    },
    RequestingNfcActivation: {
      entry: "navigateToNfcInstructionsScreen",
      on: {
        "nfc-enabled": {
          actions: assign(({ context }) => ({
            cieContext: _.merge(context.cieContext, {
              isNFCEnabled: true
            })
          })),
          target: "InsertingCardPin"
        },
        back: {
          target: "#itwEidIssuanceMachine.UserIdentification"
        }
      }
    },
    InsertingCardPin: {
      entry: [
        assign(() => ({ authenticationContext: undefined })), // Reset the authentication context, otherwise retries will use stale data
        "navigateToCiePinScreen"
      ],
      on: {
        "cie-pin-entered": {
          target: "PreparationCie",
          actions: assign(({ event }) => ({
            identification: {
              mode: "ciePin",
              level: "L3",
              pin: event.pin
            }
          }))
        },
        back: {
          target: "PreparationPin"
        }
      }
    },
    PreparationCie: {
      description:
        "This state handles the CIE preparation screen, where the user is informed about the CIE card",
      entry: "navigateToCieNfcPreparationScreen",
      on: {
        next: {
          target: "StartingCieAuthFlow"
        },
        "go-to-cie-warning": {
          target: "CieWarning.PreparationCie"
        },
        back: {
          target: "PreparationPin"
        },
        close: {
          actions: "closeIssuance"
        }
      }
    },
    StartingCieAuthFlow: {
      description:
        "Start the preliminary phase of the CIE identification flow.",
      tags: [ItwTags.Loading],
      entry: "navigateToCieAuthenticationScreen",
      invoke: {
        src: "startAuthFlow",
        input: ({ context }) => ({
          itwVersion: context.itwVersion,
          walletInstanceAttestation: context.walletInstanceAttestation?.jwt,
          identification: context.identification,
          withMRTDPoP: false
        }),
        onDone: {
          actions: assign(({ event }) => ({
            authenticationContext: event.output
          })),
          target: "ReadingCieCard"
        },
        onError: {
          actions: "setFailure",
          target: "#itwEidIssuanceMachine.Failure"
        }
      },
      on: {
        back: {
          target: "PreparationCie"
        }
      }
    },
    ReadingCieCard: {
      description:
        "Read the CIE card and get back a url to continue the PID issuing flow. This state also handles errors when reading the card.",
      on: {
        "user-identification-completed": {
          target: "#itwEidIssuanceMachine.UserIdentification.Completed",
          actions: ["completeUserIdentification", "storeAuthLevel"]
        },
        close: {
          target: "#itwEidIssuanceMachine.UserIdentification"
        },
        back: {
          target: "PreparationCie"
        }
      }
    },
    CieWarning: cieWarningState
  },
  on: {
    "select-identification-mode": [
      {
        guard: ({ event }) => event.mode === "spid",
        target: "#itwEidIssuanceMachine.UserIdentification.Spid"
      },
      {
        guard: ({ event }) => event.mode === "cieId",
        actions: [
          "trackIdentificationMethodSelected",
          "setCieIdIdentificationL2"
        ],
        target: "#itwEidIssuanceMachine.UserIdentification.CieID"
      }
    ]
  },
  onDone: {
    target: "#itwEidIssuanceMachine.UserIdentification.Completed"
  }
} as const);
