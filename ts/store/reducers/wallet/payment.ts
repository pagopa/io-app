import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { PspData } from "../../../../definitions/pagopa/PspData";
import { Locales } from "../../../../locales/locales";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../features/bonus/bpd/model/RemoteValue";
import { walletAddPaypalRefreshPMToken } from "../../../features/wallet/onboarding/paypal/store/actions";
import { PaymentManagerToken } from "../../../types/pagopa";
import { PotFromActions } from "../../../types/utils";
import { getError } from "../../../utils/errors";
import { Action } from "../../actions/types";
import {
  paymentAttiva,
  paymentCheck,
  paymentExecuteStart,
  paymentIdPolling,
  paymentInitializeEntrypointRoute,
  paymentInitializeState,
  PaymentStartOrigin,
  paymentVerifica,
  paymentWebViewEnd,
  pspForPaymentV2,
  pspSelectedForPaymentV2
} from "../../actions/wallet/payment";
import {
  addCreditCardWebViewEnd,
  refreshPMTokenWhileAddCreditCard
} from "../../actions/wallet/wallets";
import { GlobalState } from "../types";

export type EntrypointRoute = Readonly<{
  name: string;
  key: string;
}>;

export type PaymentStartPayload = Readonly<{
  idWallet: number;
  idPayment: string;
  language: Locales;
}>;

export type PaymentStartWebViewPayload = PaymentStartPayload & {
  sessionToken: PaymentManagerToken;
};

// TODO: instead of keeping one single state, it would be more correct to keep
//       a state for each RptId - this will make unnecessary to reset the state
//       at the beginning of a new payment flow.
export type PaymentState = Readonly<{
  startOrigin?: PaymentStartOrigin;
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
  entrypointRoute?: EntrypointRoute;
  // id payment, id wallet and locale (used inside paywebview)
  paymentStartPayload: PaymentStartPayload | undefined;
  // pm fresh session token (used inside paywebview)
  pmSessionToken: RemoteValue<PaymentManagerToken, Error>;
  pspsV2: {
    psps: RemoteValue<ReadonlyArray<PspData>, Error>;
    // the psp selected for the payment
    pspSelected: PspData | undefined;
  };
}>;

/**
 * Returns the payment ID if one has been fetched so far
 */
export const getPaymentIdFromGlobalState = (state: GlobalState) =>
  pot.toOption(state.wallet.payment.paymentId);

const pspV2Selector = (state: GlobalState): PaymentState["pspsV2"] =>
  state.wallet.payment.pspsV2;

/**
 * return the list of pspV2
 */
export const pspV2ListSelector = createSelector(
  pspV2Selector,
  (
    pspsV2: PaymentState["pspsV2"]
  ): RemoteValue<ReadonlyArray<PspData>, Error> => pspsV2.psps
);

/**
 * return the selected psp
 */
export const pspSelectedV2ListSelector = createSelector(
  pspV2Selector,
  (pspsV2: PaymentState["pspsV2"]): PspData | undefined => pspsV2.pspSelected
);

export const isPaymentOngoingSelector = (state: GlobalState) =>
  O.isSome(getPaymentIdFromGlobalState(state));

export const entrypointRouteSelector = (state: GlobalState) =>
  state.wallet.payment.entrypointRoute;

const paymentSelector = (state: GlobalState): PaymentState =>
  state.wallet.payment;

export const paymentVerificaSelector = createSelector(
  paymentSelector,
  (payment: PaymentState): PaymentState["verifica"] => payment.verifica
);

export const pmSessionTokenSelector = (
  state: GlobalState
): RemoteValue<PaymentManagerToken, Error> =>
  state.wallet.payment.pmSessionToken;

export const paymentIdSelector = (
  state: GlobalState
): PaymentState["paymentId"] => state.wallet.payment.paymentId;

export const paymentStartPayloadSelector = (
  state: GlobalState
): PaymentStartPayload | undefined => state.wallet.payment.paymentStartPayload;

export const paymentStartOriginSelector = createSelector(
  paymentSelector,
  payment => payment.startOrigin
);

const PAYMENT_INITIAL_STATE: PaymentState = {
  verifica: pot.none,
  attiva: pot.none,
  paymentId: pot.none,
  check: pot.none,
  entrypointRoute: undefined,
  paymentStartPayload: undefined,
  pmSessionToken: remoteUndefined,
  pspsV2: {
    psps: remoteUndefined,
    pspSelected: undefined
  }
};

/**
 * Reducer for actions that show the payment summary
 */
// eslint-disable-next-line complexity
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
      return {
        // a verifica operation will generate a new codice contesto pagamento
        // effectively starting a new payment session, thus we also invalidate
        // the rest of the payment state
        ...PAYMENT_INITIAL_STATE,
        startOrigin: action.payload.startOrigin,
        entrypointRoute: state.entrypointRoute,
        verifica: pot.noneLoading
      };
    case getType(paymentVerifica.success):
      return {
        ...state,
        verifica: pot.some(action.payload)
      };
    case getType(paymentVerifica.failure):
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
    // start payment or refresh token while add credit card
    //
    case getType(paymentExecuteStart.request):
      return {
        ...state,
        paymentStartPayload: action.payload,
        pmSessionToken: remoteLoading
      };
    case getType(walletAddPaypalRefreshPMToken.request):
    case getType(refreshPMTokenWhileAddCreditCard.request):
      return {
        ...state,
        pmSessionToken: remoteLoading
      };
    case getType(walletAddPaypalRefreshPMToken.success):
    case getType(refreshPMTokenWhileAddCreditCard.success):
    case getType(paymentExecuteStart.success):
      return {
        ...state,
        pmSessionToken: remoteReady(action.payload)
      };
    case getType(walletAddPaypalRefreshPMToken.failure):
    case getType(refreshPMTokenWhileAddCreditCard.failure):
    case getType(paymentExecuteStart.failure):
      return {
        ...state,
        pmSessionToken: remoteError(action.payload)
      };

    // end payment web view - reset data about payment
    case getType(paymentWebViewEnd):
      return {
        ...state,
        paymentStartPayload: PAYMENT_INITIAL_STATE.paymentStartPayload,
        pmSessionToken: PAYMENT_INITIAL_STATE.pmSessionToken
      };
    // end add credit card web view - reset pm session token data
    case getType(addCreditCardWebViewEnd):
      return {
        ...state,
        pmSessionToken: PAYMENT_INITIAL_STATE.pmSessionToken
      };
    case getType(pspForPaymentV2.request):
      return {
        ...state,
        pspsV2: {
          ...state.pspsV2,
          psps: remoteLoading,
          pspSelected: undefined
        }
      };
    case getType(pspForPaymentV2.success):
      return {
        ...state,
        pspsV2: {
          ...state.pspsV2,
          psps: remoteReady(action.payload)
        }
      };
    case getType(pspForPaymentV2.failure):
      return {
        ...state,
        pspsV2: {
          ...state.pspsV2,
          psps: remoteError(getError(action.payload))
        }
      };
    case getType(pspSelectedForPaymentV2):
      return {
        ...state,
        pspsV2: {
          ...state.pspsV2,
          pspSelected: action.payload
        }
      };
  }
  return state;
};

export default reducer;
