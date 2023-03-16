import { assign, createMachine } from "xstate";
import { LOADING_TAG, WAITING_USER_INPUT_TAG } from "../../../../utils/xstate";
import { Context } from "./context";
import { Events } from "./events";
import { Services } from "./services";

type UnsubscriptionMachineParams = {
  initiativeId: string;
  initiativeName?: string;
};

const createIDPayUnsubscriptionMachine = (
  params: UnsubscriptionMachineParams
) =>
  createMachine(
    {
      /** @xstate-layout N4IgpgJg5mDOIC5QEkAiAFAggTQPoFUA5AZXwCFiBhAJWXQBVkB5QgYgFEANZegbQAYAuolAAHAPawAlgBcp4gHYiQAD0QBOABwAmAHQBmAIwA2fQHYALP20XN-Y5oA0IAJ6JD2gL6fnaLHiJSCho6RhZdAHVMHmRCAHFcWJjMRgA1dlxidgAZdkowtizc-MTCZLT2AWEkEAlpOUVlNQR9C0NdTQBWQ06LfSMzdUMLTs7nNwRtfnbjPu1DMzNOxeNRs29fDBwCEnIqWgZmQl1UZGJ0bJxYhMoWADFkagBZFKPWW8IH552g-dCjqrKOqyeRKGrNTTGdrWfpaEZ9CzqCzjRDaGy6KHqQbaSH8azdCwbEB+baBPYhQ7hMnBWhka6sCCKMC6KQKABu4gA1syAK4KWA8gBGsAAxgAnKSCsB3MXiAC2yAUIIAhnI2WBATVgQ0waBmj0jLoYeZlnZ+GYHCjJvxNLozPwjDbcfxeupOkSSQFdjT-lTvX86fFWGAxbKxbpRAAbVUAM3EYrluj5AuF4sl0tlCqVclVUnVmrEkhBjXB7k6huNSzMZotTlciCMxjtDo8xmMFsROO8PhACnEEDgyk9P3JBwKQKLOqaiAAtIYrW7dCMjPoHfpZvw3YSe8PqX9KccojF4qVysh0pkcnlx1rJ6DpwgLGYrWjOrpDIYseoccY8doCR6Wxer8FIFCcZwXFcJ4fF8Lw3oW9T3qWCC9G+FgjDieL2ssnR1hMUwzJ+FrmN+nYuoB-gjj6B66HuISBnEE6ISWeruIY+hvsa6jTJomiGHieHuN+75Ee2Zjruo6gcdumyUXRY5HLR-qgUcmT4JQlDsMQxBMcWuqqO4gy2sYbo2BxG4OGM9YIIYOi6G6jporxm42O6O5AVR+5gfJvqELgdzRNk+DUOwulTshCxaBipl9J0FldC+3H2eWHjTPwy4Otu3hAA */
      context: {
        initiativeId: params.initiativeId,
        initiativeName: params.initiativeName
      },
      tsTypes: {} as import("./machine.typegen").Typegen0,
      schema: {
        context: {} as Context,
        events: {} as Events,
        services: {} as Services
      },
      predictableActionArguments: true,
      id: "IDPAY_UNSUBSCRIPTION",
      initial: "START_UNSUBSCRIPTION",
      entry: "navigateToConfirmationScreen",
      states: {
        START_UNSUBSCRIPTION: {
          tags: [LOADING_TAG],
          always: [
            {
              cond: "requiresInitiativeInfo",
              target: "LOADING_INITIATIVE_INFO"
            },
            {
              target: "DISPLAYING_CONFIRMATION"
            }
          ]
        },
        LOADING_INITIATIVE_INFO: {
          tags: [LOADING_TAG],
          invoke: {
            id: "getInitiativeInfo",
            src: "getInitiativeInfo",
            onDone: {
              actions: "loadInitiativeSuccess",
              target: "DISPLAYING_CONFIRMATION"
            },
            onError: {
              target: "UNSUBSCRIPTION_FAILURE"
            }
          }
        },
        DISPLAYING_CONFIRMATION: {
          tags: [WAITING_USER_INPUT_TAG],
          on: {
            EXIT: {
              actions: "exitUnsubscription"
            },
            CONFIRM_UNSUBSCRIPTION: {
              target: "UNSUBSCRIBING"
            }
          }
        },
        UNSUBSCRIBING: {
          tags: [LOADING_TAG],
          invoke: {
            id: "unsubscribeFromInitiative",
            src: "unsubscribeFromInitiative",
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
          on: {
            EXIT: {
              actions: "exitToWallet"
            }
          }
        },
        UNSUBSCRIPTION_FAILURE: {
          entry: "navigateToFailureScreen",
          on: {
            EXIT: {
              actions: "exitUnsubscription"
            }
          }
        }
      }
    },
    {
      actions: {
        loadInitiativeSuccess: assign((_, event) => ({
          initiative: event.data.initiativeName
        }))
      },
      guards: {
        requiresInitiativeInfo
      }
    }
  );

const requiresInitiativeInfo = (context: Context) =>
  context.initiativeName === undefined;

type IDPayUnsubscriptionMachineType = ReturnType<
  typeof createIDPayUnsubscriptionMachine
>;

export type { IDPayUnsubscriptionMachineType, UnsubscriptionMachineParams };
export { createIDPayUnsubscriptionMachine };
