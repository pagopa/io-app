import * as pot from "italia-ts-commons/lib/pot";
import { getType } from "typesafe-actions";

import { PotFromActions } from "../../../types/utils";
import { pspsForLocale } from "../../../utils/payment";
import { Action } from "../../actions/types";
import {
  paymentAttiva,
  paymentCheck,
  paymentExecutePayment,
  paymentFetchPspsForPaymentId,
  paymentIdPolling,
  paymentInitializeEntrypointRoute,
  paymentInitializeState,
  paymentVerifica
} from "../../actions/wallet/payment";
import {
  pollTransactionSagaCompleted,
  pollTransactionSagaTimeout,
  runPollTransactionSaga
} from "../../actions/wallet/transactions";
import { GlobalState } from "../types";
import { RTron } from "../../../boot/configureStoreAndPersistor";

export type EntrypointRoute = Readonly<{
  name: string;
  key: string;
}>;

// TODO: instead of keeping one single state, it would me more correct to keep
//       a state for each rptid - this will make unnecessary to reset the state
//       at the beginning of a new payment flow.
export type PaymentState = Readonly<{
  verifica: PotFromActions<
    typeof paymentVerifica["success"],
    typeof paymentVerifica["failure"]
  >;
  attiva: PotFromActions<
    typeof paymentAttiva["success"],
    typeof paymentAttiva["failure"]
  >;
  paymentId: PotFromActions<
    typeof paymentIdPolling["success"],
    typeof paymentIdPolling["failure"]
  >;
  check: PotFromActions<
    typeof paymentCheck["success"],
    typeof paymentCheck["failure"]
  >;
  psps: PotFromActions<
    typeof paymentFetchPspsForPaymentId["success"],
    typeof paymentFetchPspsForPaymentId["failure"]
  >;
  transaction: PotFromActions<
    typeof paymentExecutePayment["success"],
    typeof paymentExecutePayment["failure"]
  >;
  confirmedTransaction: PotFromActions<
    typeof pollTransactionSagaCompleted,
    false
  >;
  entrypointRoute?: EntrypointRoute;
}>;

/**
 * Returns the payment ID if one has been fetched so far
 */
const getPaymentIdFromGlobalState = (state: GlobalState) =>
  pot.toOption(state.wallet.payment.paymentId);

export const isPaymentOngoingSelector = (state: GlobalState) =>
  getPaymentIdFromGlobalState(state).isSome();

export const entrypointRouteSelector = (state: GlobalState) =>
  state.wallet.payment.entrypointRoute;

const PAYMENT_INITIAL_STATE: PaymentState = {
  verifica: pot.none,
  attiva: pot.none,
  paymentId: pot.none,
  check: pot.none,
  psps: pot.none,
  transaction: pot.none,
  confirmedTransaction: pot.none,
  entrypointRoute: undefined
};

/**
 * Reducer for actions that show the payment summary
 */
const reducer = (
  state: PaymentState = PAYMENT_INITIAL_STATE,
  action: Action
): PaymentState => {
  switch (action.type) {
    // start a new payment from scratch
    case getType(paymentInitializeState):
      return PAYMENT_INITIAL_STATE;
    // track the route whence the payment started
    case getType(paymentInitializeEntrypointRoute):
      return {
        ...state,
        entrypointRoute: action.payload
      };
    //
    // verifica
    //
    case getType(paymentVerifica.request):
      RTron.log("paymentVerifica.request", action.payload);
      return {
        // a verifica operation will generate a new codice contesto pagamento
        // effectively starting a new payment session, thus we also invalidate
        // the rest of the payment state
        ...PAYMENT_INITIAL_STATE,
        entrypointRoute: state.entrypointRoute,
        verifica: pot.noneLoading
      };
    case getType(paymentVerifica.success):
      RTron.log("paymentVerifica.success", action.payload);
      return {
        ...state,
        verifica: pot.some(action.payload)
      };
    case getType(paymentVerifica.failure):
      RTron.log("paymentVerifica.failure", action.payload);
      return {
        ...state,
        verifica: pot.noneError(action.payload)
      };

    //
    // attiva
    //
    case getType(paymentAttiva.request):
      return {
        ...state,
        attiva: pot.noneLoading
      };
    case getType(paymentAttiva.success):
      return {
        ...state,
        attiva: pot.some(action.payload)
      };
    case getType(paymentAttiva.failure):
      return {
        ...state,
        attiva: pot.noneError(action.payload)
      };

    //
    // payment ID polling
    //
    case getType(paymentIdPolling.request):
      return {
        ...state,
        paymentId: pot.noneLoading
      };
    case getType(paymentIdPolling.success):
      return {
        ...state,
        paymentId: pot.some(action.payload)
      };
    case getType(paymentIdPolling.failure):
      return {
        ...state,
        paymentId: pot.noneError(action.payload)
      };

    //
    // check payment
    //
    case getType(paymentCheck.request):
      return {
        ...state,
        check: pot.noneLoading
      };
    case getType(paymentCheck.success):
      return {
        ...state,
        check: pot.some<true>(true)
      };
    case getType(paymentCheck.failure):
      return {
        ...state,
        check: pot.noneError(action.payload)
      };

    //
    // fetch available psps
    //
    case getType(paymentFetchPspsForPaymentId.request):
      return {
        ...state,
        psps: pot.noneLoading
      };
    case getType(paymentFetchPspsForPaymentId.success):
      // before storing the PSPs, filter only the PSPs for the current locale
      return {
        ...state,
        psps: pot.some(pspsForLocale(action.payload))
      };
    case getType(paymentFetchPspsForPaymentId.failure):
      return {
        ...state,
        psps: pot.noneError(action.payload)
      };

    //
    // execute payment
    //
    case getType(paymentExecutePayment.request):
      return {
        ...state,
        transaction: pot.noneLoading
      };
    case getType(paymentExecutePayment.success):
      return {
        ...state,
        transaction: pot.some(action.payload)
      };
    case getType(paymentExecutePayment.failure):
      return {
        ...state,
        transaction: pot.noneError(action.payload)
      };

    //
    // confirmed transaction
    //
    case getType(runPollTransactionSaga):
      return {
        ...state,
        confirmedTransaction: pot.noneLoading
      };
    case getType(pollTransactionSagaCompleted):
      return {
        ...state,
        confirmedTransaction: pot.some(action.payload)
      };
    case getType(pollTransactionSagaTimeout):
      return {
        ...state,
        confirmedTransaction: pot.noneError<false>(false)
      };
  }
  return state;
};

export default reducer;
