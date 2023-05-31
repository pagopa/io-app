import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { assign, createMachine } from "xstate";
import { LOADING_TAG, WAITING_USER_INPUT_TAG } from "../../../../utils/xstate";
import { Context, INITIAL_CONTEXT } from "./context";
import { Events } from "./events";
import { PaymentFailure, PaymentFailureEnum } from "./failure";
import { Services } from "./services";

const createIDPayPaymentMachine = () =>
  createMachine(
    {
      /** @xstate-layout N4IgpgJg5mDOIC5QEkAiAFAggTQPoFUA5AZXwCFiBhAJWXQBVkB5QgYgFEANZegbQAYAuolAAHAPawAlgBcp4gHYiQAD0QBOABwAmAHQBmAIwA2fQHYALP20XN-Y5oA0IAJ6JD2gL6fnaLHiJSCho6RhZdAHVMHmRCAHFcWJjMRgA1dlxidgAZdkowtizc-MTCZLT2AWEkEAlpOUVlNQR9C0NdTQBWQ06LfSMzdUMLTs7nNwRtfnbjPu1DMzNOxeNRs29fDBwCEnIqWgZmQl1UZGJ0bJxYhMoWADFkagBZFKPWW8IH552g-dCjqrKOqyeRKGrNTTGdrWfpaEZ9CzqCzjRDaGy6KHqQbaSH8azdCwbEB+baBPYhQ7hMnBWhka6sCCKMC6KQKABu4gA1syAK4KWA8gBGsAAxgAnKSCsB3MXiAC2yAUIIAhnI2WBATVgQ0waBmj0jLoYeZlnZ+GYHCjJvxNLozPwjDbcfxeupOkSSQFdjT-lTvX86fFWGAxbKxbpRAAbVUAM3EYrluj5AuF4sl0tlCqVclVUnVmrEkhBjXB7k6huNSzMZotTlciCMxjtDo8xmMFsROO8PhACnEEDgyk9P3JBwKQKLOqaiAAtIYrW7dCMjPoHfpZvw3YSe8PqX9KccojF4qVysh0pkcnlx1rJ6DpwgLGYrWjOrpDIYseoccY8doCR6Wxer8FIFCcZwXFcJ4fF8Lw3oW9T3qWCC9G+FgjDieL2ssnR1hMUwzJ+FrmN+nYuoB-gjj6B66HuISBnEE6ISWeruIY+hvsa6jTJomiGHieHuN+75Ee2Zjruo6gcdumyUXRY5HLR-qgUcmT4JQlDsMQxBMcWuqqO4gy2sYbo2BxG4OGM9YIIYOi6G6jporxm42O6O5AVR+5gfJvqELgdzRNk+DUOwulTshCxaBipl9J0FldC+3H2eWHjTPwy4Otu3hAA */
      context: INITIAL_CONTEXT,
      tsTypes: {} as import("./machine.typegen").Typegen0,
      schema: {
        context: {} as Context,
        events: {} as Events,
        services: {} as Services
      },
      predictableActionArguments: true,
      id: "IDPAY_PAYMENT",
      initial: "AWAITING_TRX_CODE",
      states: {
        AWAITING_TRX_CODE: {
          tags: [WAITING_USER_INPUT_TAG],
          on: {
            START_AUTHORIZATION: {
              target: "PRE_AUTHORIZING",
              actions: "startAuthorization"
            }
          }
        },
        PRE_AUTHORIZING: {
          tags: [LOADING_TAG],
          entry: "navigateToAuthorizationScreen",
          invoke: {
            id: "preAuthorizePayment",
            src: "preAuthorizePayment",
            onDone: {
              actions: "setTransactionData",
              target: "AWAITING_USER_CONFIRMATION"
            },
            onError: {
              actions: "setFailure",
              target: "AUTHORIZATION_FAILURE"
            }
          }
        },
        AWAITING_USER_CONFIRMATION: {
          tags: [WAITING_USER_INPUT_TAG],
          on: {
            CONFIRM_AUTHORIZATION: {
              target: "AUTHORIZING"
            },
            CANCEL_AUTHORIZATION: {
              actions: "cancelTransaction",
              target: "AUTHORIZATION_FAILURE"
            }
          }
        },
        AUTHORIZING: {
          tags: [LOADING_TAG],
          invoke: {
            id: "authorizePayment",
            src: "authorizePayment",
            onDone: {
              target: "AUTHORIZATION_SUCCESS"
            },
            onError: {
              actions: "setFailure",
              target: "AUTHORIZATION_FAILURE"
            }
          }
        },
        AUTHORIZATION_SUCCESS: {
          entry: "navigateToResultScreen",
          on: {
            EXIT: {
              actions: "exitAuthorization"
            }
          }
        },
        AUTHORIZATION_FAILURE: {
          entry: "navigateToResultScreen",
          on: {
            EXIT: {
              actions: "exitAuthorization"
            }
          }
        }
      }
    },
    {
      actions: {
        startAuthorization: assign((_, event) => ({
          trxCode: O.some(event.trxCode)
        })),
        setTransactionData: assign((_, event) => ({
          transactionData: O.some(event.data)
        })),
        setFailure: assign((_, event) => ({
          failure: pipe(O.of(event.data), O.filter(PaymentFailure.is))
        })),
        cancelTransaction: assign(_ => ({
          failure: O.some(PaymentFailureEnum.CANCELLED)
        }))
      },
      guards: {}
    }
  );

type IDPayPaymentMachineType = ReturnType<typeof createIDPayPaymentMachine>;

export type { IDPayPaymentMachineType };
export { createIDPayPaymentMachine };
