import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { flow, pipe } from "fp-ts/lib/function";
import { assertEvent, assign, fromPromise, setup } from "xstate";
import { AuthPaymentResponseDTO } from "../../../../../definitions/idpay/AuthPaymentResponseDTO";
import { IdPayTags } from "../../common/machine/tags";
import { IDPayTransactionCode } from "../common/types";
import { PaymentFailure, PaymentFailureEnum } from "../types/PaymentFailure";
import * as Context from "./context";
import * as Events from "./events";

const notImplementedStub = () => {
  throw new Error("Not implemented");
};

export const idPayPaymentMachine = setup({
  types: {
    context: {} as Context.Context,
    events: {} as Events.Events
  },
  actors: {
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
    showErrorToast: notImplementedStub
  },
  guards: {
    isSessionExpired: ({ context }) =>
      pipe(
        context.failure,
        O.map(failure => failure === PaymentFailureEnum.SESSION_EXPIRED),
        O.getOrElse(() => false)
      ),
    assertTransactionCode: ({ event }) => {
      assertEvent(event, "authorize-payment");
      return pipe(event.trxCode, IDPayTransactionCode.decode, E.isRight);
    }
  }
}).createMachine({
  context: Context.Context,
  id: "idpay-payment",
  initial: "Idle",
  states: {
    Idle: {
      on: {
        "authorize-payment": {
          guard: "assertTransactionCode",
          target: "PreAuthorizing",
          actions: assign(({ event }) => ({
            trxCode: event.trxCode,
            data_entry: event.data_entry
          }))
        }
      }
    },
    PreAuthorizing: {
      tags: [IdPayTags.Loading],
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
            failure: decodeFailure(event.error)
          })),
          target: "AuthorizationFailure"
        }
      }
    },

    AwaitingConfirmation: {
      entry: "navigateToAuthorizationScreen",
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
      tags: [IdPayTags.Loading, IdPayTags.DisableButtons],
      invoke: {
        id: "deletePayment",
        src: "deletePayment",
        input: ({ context }) => context.trxCode,
        onDone: {
          target: "AuthorizationCancelled"
        },
        onError: [
          {
            guard: ({ event }) => isBlockingFalure(event.error),
            actions: assign(({ event }) => ({
              failure: decodeFailure(event.error)
            })),
            target: "AuthorizationFailure"
          },
          {
            actions: "showErrorToast",
            target: "AwaitingConfirmation"
          }
        ]
      }
    },

    Authorizing: {
      tags: [IdPayTags.Loading, IdPayTags.DisableButtons],
      invoke: {
        id: "authorizePayment",
        src: "authorizePayment",
        input: ({ context }) => context.trxCode,
        onDone: {
          target: "AuthorizationSuccess"
        },
        onError: [
          {
            guard: ({ event }) => isBlockingFalure(event.error),
            actions: assign(({ event }) => ({
              failure: decodeFailure(event.error)
            })),
            target: "AuthorizationFailure"
          },
          {
            actions: "showErrorToast",
            target: "AwaitingConfirmation"
          }
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

const decodeFailure = flow(PaymentFailure.decode, O.fromEither);

const isBlockingFalure = flow(
  decodeFailure,
  O.map(failure => failure !== PaymentFailureEnum.PAYMENT_TOO_MANY_REQUESTS),
  O.getOrElse(() => false)
);
