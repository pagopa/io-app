import * as O from "fp-ts/lib/Option";
import { assign, createMachine } from "xstate";
import { LOADING_TAG, WAITING_USER_INPUT_TAG } from "../../../../utils/xstate";
import { Context, INITIAL_CONTEXT } from "./context";
import { Events } from "./events";
import { Services } from "./services";

const createIDPayUnsubscriptionMachine = () =>
  createMachine(
    {
      context: INITIAL_CONTEXT,
      tsTypes: {} as import("./machine.typegen").Typegen0,
      schema: {
        context: {} as Context,
        events: {} as Events,
        services: {} as Services
      },
      predictableActionArguments: true,
      id: "IDPAY_UNSUBSCRIPTION",
      initial: "WAITING_INITIATIVE_SELECTION",
      states: {
        WAITING_INITIATIVE_SELECTION: {
          on: {
            SELECT_INITIATIVE: {
              actions: "selectInitiative",
              target: "DISPLAYING_CONFIRMATION"
            }
          }
        },
        DISPLAYING_CONFIRMATION: {
          tags: [WAITING_USER_INPUT_TAG],
          entry: "navigateToConfirmationScreen",
          on: {
            CONFIRM_UNSUBSCRIPTION: {
              target: "UNSUBSCRIBING"
            }
          }
        },
        UNSUBSCRIBING: {
          tags: [LOADING_TAG],
          invoke: {
            src: "unsubscribeFromInitiative",
            id: "unsubscribeFromInitiative",
            onDone: {
              target: "UNSUBSCRIPTION_SUCCESS"
            },
            onError: {
              target: "UNSUBSCRIPTION_FAILURE"
            }
          }
        },
        UNSUBSCRIPTION_SUCCESS: {
          entry: "navigateToSuccessScreen",
          type: "final"
        },
        UNSUBSCRIPTION_FAILURE: {
          entry: "navigateToFailureScreen",
          type: "final"
        }
      }
    },
    {
      actions: {
        selectInitiative: assign((_, event) => ({
          initiativeId: O.some(event.initiativeId),
          initiativeName: event.initiativeName
        }))
      }
    }
  );

type IDPayUnsubscriptionMachineType = ReturnType<
  typeof createIDPayUnsubscriptionMachine
>;

export type { IDPayUnsubscriptionMachineType };
export { createIDPayUnsubscriptionMachine };
