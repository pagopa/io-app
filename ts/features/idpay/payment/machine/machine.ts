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
    asserTransactionCode: ({ event }) => {
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
      tags: [IdPayTags.Loading],
      on: {
        "authorize-payment": {
          guard: "asserTransactionCode",
          target: "PreAuthorizing",
          actions: assign(({ event }) => ({ trxCode: event.trxCode }))
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
      tags: [IdPayTags.Loading],
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
      tags: [IdPayTags.Loading],
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
  O.map(failure => failure !== PaymentFailureEnum.TOO_MANY_REQUESTS),
  O.getOrElse(() => false)
);
