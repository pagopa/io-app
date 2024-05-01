import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { assertEvent, assign, fromPromise, setup } from "xstate";
import { AuthPaymentResponseDTO } from "../../../../../definitions/idpay/AuthPaymentResponseDTO";
import {
  LOADING_TAG,
  UPSERTING_TAG,
  WAITING_USER_INPUT_TAG,
  notImplementedStub
} from "../../../../xstate/utils";
import { PaymentFailure } from "../types/PaymentFailure";
import * as Context from "./context";
import * as Events from "./events";
import * as Input from "./input";

export const idPayPaymentMachine = setup({
  types: {
    input: {} as Input.Input,
    context: {} as Context.Context,
    events: {} as Events.Events
  },
  actors: {
    onInit: fromPromise<Context.Context, Input.Input>(({ input }) =>
      Input.Input(input)
    ),
    preAuthorizePayment: fromPromise<AuthPaymentResponseDTO, string>(
      notImplementedStub
    ),
    deletePayment: fromPromise<undefined, string>(notImplementedStub),
    authorizePayment: fromPromise<AuthPaymentResponseDTO, string>(
      notImplementedStub
    )
  },
  actions: {
    navigateToAuthorizationScreen: notImplementedStub,
    navigateToResultScreen: notImplementedStub,
    closeAuthorization: notImplementedStub,
    setFailure: notImplementedStub,
    showErrorToast: notImplementedStub
  },
  guards: {
    isSessionExpired: () => false,
    isBlockingFailure: () => false
  }
}).createMachine({
  context: Context.Context,
  id: "idpay-payment",
  initial: "Idle",
  states: {
    Idle: {
      tags: [LOADING_TAG],
      on: {
        "authorize-payment": {
          target: "PreAuthorizing"
        }
      }
    },
    PreAuthorizing: {
      tags: [LOADING_TAG],
      entry: "navigateToAuthorizationScreen",
      invoke: {
        id: "preAuthorizePayment",
        src: "preAuthorizePayment",
        input: ({ event }) => {
          assertEvent(event, "authorize-payment");
          return event.trxCode;
        },
        onDone: {
          actions: assign(({ event }) => ({
            transactionData: O.some(event.output)
          })),
          target: "AwaitingConfirmation"
        },
        onError: {
          actions: assign(({ event }) => ({
            failure: pipe(PaymentFailure.decode(event.error), O.fromEither)
          })),
          target: "AuthorizationFailure"
        }
      }
    },

    AwaitingConfirmation: {
      tags: [WAITING_USER_INPUT_TAG],
      on: {
        next: {
          target: "Authorizing"
        },
        close: {
          target: "Cancelling"
        }
      }
    },

    Cancelling: {
      tags: [UPSERTING_TAG],
      invoke: {
        id: "deletePayment",
        src: "deletePayment",
        input: ({ context }) => context.trxCode,
        onDone: {
          target: "AuthorizationCancelled"
        },
        onError: [
          {
            actions: assign(({ event }) => ({
              failure: pipe(PaymentFailure.decode(event.error), O.fromEither)
            }))
          },
          [
            {
              guard: "isBlockingFailure",
              target: "AuthorizationFailure"
            },
            {
              actions: "showErrorToast",
              target: "AwaitingConfirmation"
            }
          ]
        ]
      }
    },

    Authorizing: {
      tags: [UPSERTING_TAG],
      invoke: {
        id: "authorizePayment",
        src: "authorizePayment",
        input: ({ context }) => context.trxCode,
        onDone: {
          target: "AuthorizationSuccess"
        },
        onError: [
          {
            actions: assign(({ event }) => ({
              failure: pipe(PaymentFailure.decode(event.error), O.fromEither)
            }))
          },
          [
            {
              guard: "isBlockingFailure",
              target: "AuthorizationFailure"
            },
            {
              actions: "showErrorToast",
              target: "AwaitingConfirmation"
            }
          ]
        ]
      }
    },

    AuthorizationSuccess: {
      entry: "navigateToResultScreen",
      on: {
        close: {
          actions: "closeAuthorization"
        }
      }
    },

    AuthorizationCancelled: {
      entry: "navigateToResultScreen",
      on: {
        close: {
          actions: "closeAuthorization"
        }
      }
    },

    AuthorizationFailure: {
      entry: "navigateToResultScreen",
      always: {
        guard: "isSessionExpired",
        target: "SessionExpired"
      },
      on: {
        close: {
          actions: "closeAuthorization"
        }
      }
    },

    SessionExpired: {
      entry: "closeAuthorization"
    }
  }
});
