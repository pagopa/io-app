import { createMachine } from "xstate";
import { InitiativeDTO } from "../../../../../definitions/idpay/InitiativeDTO";
import { LOADING_TAG, WAITING_USER_INPUT_TAG } from "../../../../utils/xstate";
import { Context } from "./context";
import { Events } from "./events";
import { Services } from "./services";

const createIDPayUnsubscriptionMachine = (initiative: InitiativeDTO) =>
  createMachine(
    {
      context: {
        initiative
      },
      tsTypes: {} as import("./machine.typegen").Typegen0,
      schema: {
        context: {} as Context,
        events: {} as Events,
        services: {} as Services
      },
      predictableActionArguments: true,
      id: "IDPAY_UNSUBSCRIPTION",
      initial: "DISPLAYING_CONFIRMATION",
      on: {},
      states: {
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
    {}
  );

type IDPayUnsubscriptionMachineType = ReturnType<
  typeof createIDPayUnsubscriptionMachine
>;

export type { IDPayUnsubscriptionMachineType };
export { createIDPayUnsubscriptionMachine };
