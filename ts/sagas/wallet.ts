// tslint:disable:max-union-size

/**
 * A saga that manages the Wallet.
 */

import { Option } from "fp-ts/lib/Option";
import {
  call,
  Effect,
  put,
  select,
  take,
  takeLatest
} from "redux-saga/effects";
import { ActionType, getType, isActionOf } from "typesafe-actions";

import { BackendClient } from "../api/backend";
import { PagoPaClient } from "../api/pagopa";
import { apiUrlPrefix } from "../config";

import {
  paymentAttivaFailure,
  paymentAttivaRequest,
  paymentAttivaSuccess,
  paymentCheckFailure,
  paymentCheckRequest,
  paymentCheckSuccess,
  paymentFetchPspsForPaymentIdFailure,
  paymentFetchPspsForPaymentIdRequest,
  paymentFetchPspsForPaymentIdSuccess,
  paymentIdPollingFailure,
  paymentIdPollingRequest,
  paymentIdPollingSuccess,
  paymentUpdateWalletPspRequest,
  paymentVerificaRequest,
  runStartOrResumePaymentSaga
} from "../store/actions/wallet/payment";
import { fetchTransactionsRequest } from "../store/actions/wallet/transactions";
import {
  addWalletCreditCardFailure,
  addWalletCreditCardRequest,
  addWalletCreditCardSuccess,
  creditCardCheckout3dsRequest,
  deleteWalletRequest,
  fetchWalletsFailure,
  fetchWalletsRequest,
  fetchWalletsSuccess,
  payCreditCardVerificationFailure,
  payCreditCardVerificationRequest,
  payCreditCardVerificationSuccess,
  runStartOrResumeAddCreditCardSaga
} from "../store/actions/wallet/wallets";
import { GlobalState } from "../store/reducers/types";
import { getPagoPaToken } from "../store/reducers/wallet/pagopa";

import { NullableWallet, PagopaToken, PayRequest } from "../types/pagopa";
import { SessionToken } from "../types/SessionToken";

import { constantPollingFetch, pagopaFetch } from "../utils/fetch";

import { fetchAndStorePagoPaToken } from "./wallet/utils";

import {
  addWalletCreditCardRequestHandler,
  deleteWalletRequestHandler,
  fetchTransactionsRequestHandler,
  fetchWalletsRequestHandler,
  payCreditCardVerificationRequestHandler,
  paymentAttivaRequestHandler,
  paymentCheckRequestHandler,
  paymentFetchPspsForWalletRequestHandler,
  paymentIdPollingRequestHandler,
  paymentVerificaRequestHandler,
  updateWalletPspRequestHandler
} from "./wallet/pagopaApis";

import * as pot from "../types/pot";

const MAX_RETRIES_POLLING = 180;
const DELAY_BETWEEN_RETRIES_MS = 1000;

/**
 * This saga manages the flow for adding a new card.
 *
 * Adding a new card can happen either from the wallet home screen or during the
 * payment process from the payment method selection screen.
 *
 * Run from ConfirmCardDetailsScreen
 */
// tslint:disable-next-line:cognitive-complexity
function* startOrResumeAddCreditCardSaga(
  action: ActionType<typeof runStartOrResumeAddCreditCardSaga>
) {
  const creditCardWallet: NullableWallet = {
    idWallet: null,
    type: "CREDIT_CARD",
    favourite: action.payload.setAsFavorite,
    creditCard: action.payload.creditCard,
    psp: undefined
  };

  while (true) {
    // before each step we select the updated payment state to know what has
    // been already done.
    const state: GlobalState["wallet"]["wallets"] = yield select<GlobalState>(
      _ => _.wallet.wallets
    );

    if (pot.isNone(state.creditCardAddWallet)) {
      yield put(addWalletCreditCardRequest({ creditcard: creditCardWallet }));
      const responseAction = yield take([
        getType(addWalletCreditCardSuccess),
        getType(addWalletCreditCardFailure)
      ]);
      if (isActionOf(addWalletCreditCardFailure, responseAction)) {
        // this step failed, exit the flow
        return;
      }
      // all is ok, continue to the next step
      continue;
    }

    const { idWallet } = state.creditCardAddWallet.value.data;

    if (pot.isNone(state.creditCardVerification)) {
      const payRequest: PayRequest = {
        data: {
          idWallet,
          tipo: "web",
          cvv: action.payload.creditCard.securityCode
            ? action.payload.creditCard.securityCode
            : undefined
        }
      };
      yield put(
        payCreditCardVerificationRequest({
          payRequest,
          language: action.payload.language
        })
      );
      const responseAction = yield take([
        getType(payCreditCardVerificationSuccess),
        getType(payCreditCardVerificationFailure)
      ]);
      if (isActionOf(payCreditCardVerificationFailure, responseAction)) {
        // this step failed, exit the flow
        return;
      }
      // all is ok, continue to the next step
      continue;
    }

    const urlCheckout3ds =
      state.creditCardVerification.value.data.urlCheckout3ds;
    const pagoPaToken: Option<PagopaToken> = yield select<GlobalState>(
      getPagoPaToken
    );

    if (
      pot.isNone(state.creditCardCheckout3ds) &&
      urlCheckout3ds !== undefined &&
      pagoPaToken.isSome()
    ) {
      yield put(
        creditCardCheckout3dsRequest({
          urlCheckout3ds,
          pagopaToken: pagoPaToken.value
        })
      );
      const responseAction = yield take([
        getType(addWalletCreditCardSuccess),
        getType(addWalletCreditCardFailure)
      ]);
      if (isActionOf(addWalletCreditCardFailure, responseAction)) {
        // this step failed, exit the flow
        return;
      }
      // all is ok, continue to the next step
      continue;
    }

    // There currently is no way of determining whether the card has been added
    // successfully from the URL returned in the webview, so the approach here
    // is to fetch the wallets and look for a wallet with the same ID of the
    // wallet we just added.
    // TODO: find a way of finding out the result of the request from the URL
    yield put(fetchWalletsRequest());
    const fetchWalletsResultAction = yield take([
      getType(fetchWalletsSuccess),
      getType(fetchWalletsFailure)
    ]);
    if (isActionOf(fetchWalletsSuccess, fetchWalletsResultAction)) {
      const updatedWallets = fetchWalletsResultAction.payload;
      const maybeAddedWallet = updatedWallets.find(
        _ => _.idWallet === idWallet
      );
      if (maybeAddedWallet) {
        // signal the completion
        if (action.payload.onSuccess) {
          action.payload.onSuccess();
        }
      }
    }

    // TODO: set as favorite

    break;
  }
}

/**
 * This saga will run in sequence the requests needed to activate a payment:
 *
 * 1) attiva -> nodo
 * 2) polling for a payment id <- nodo
 * 3) check -> payment manager
 * 4) available PSPs <- payment manager
 *
 * Each step has a corresponding state in the wallet.payment state that gets
 * updated with the "pot" state (none -> loading -> some|error).
 *
 * Each time the saga is run, it will resume from the next step that needs to
 * be executed (either because it never executed or because it previously
 * returned an error).
 *
 * Not that the Pagopa activation flow is not really resumable in case a step
 * returns an error (i.e. the steps are not idempotent).
 *
 * TODO: the resume logic may be made more intelligent by analyzing the error
 *       of each step and proceeed to the next step under certain conditions.
 */
// tslint:disable-next-line:cognitive-complexity
function* startOrResumePaymentSaga(
  action: ActionType<typeof runStartOrResumePaymentSaga>
) {
  while (true) {
    // before each step we select the updated payment state to know what has
    // been already done.
    const paymentState: GlobalState["wallet"]["payment"] = yield select<
      GlobalState
    >(_ => _.wallet.payment);

    // first step: Attiva
    if (pot.isNone(paymentState.attiva)) {
      // this step needs to be executed
      yield put(
        paymentAttivaRequest({
          rptId: action.payload.rptId,
          verifica: action.payload.verifica
        })
      );
      const responseAction = yield take([
        getType(paymentAttivaSuccess),
        getType(paymentAttivaFailure)
      ]);
      if (isActionOf(paymentAttivaFailure, responseAction)) {
        // this step failed, exit the flow
        return;
      }
      // all is ok, continue to the next step
      continue;
    }

    // second step: poll for payment ID
    if (pot.isNone(paymentState.paymentId)) {
      // this step needs to be executed
      yield put(paymentIdPollingRequest(action.payload.verifica));
      const responseAction = yield take([
        getType(paymentIdPollingSuccess),
        getType(paymentIdPollingFailure)
      ]);
      if (isActionOf(paymentIdPollingFailure, responseAction)) {
        // this step failed, exit the flow
        return;
      }
      // all is ok, continue to the next step
      continue;
    }

    // third step: "check" the payment
    if (pot.isNone(paymentState.check)) {
      // this step needs to be executed
      yield put(paymentCheckRequest(paymentState.paymentId.value));
      const responseAction = yield take([
        getType(paymentCheckSuccess),
        getType(paymentCheckFailure)
      ]);
      if (isActionOf(paymentCheckFailure, responseAction)) {
        // this step failed, exit the flow
        return;
      }
      // all is ok, continue to the next step
      continue;
    }

    // fourth step: fetch the PSPs available for this payment
    if (pot.isNone(paymentState.psps)) {
      // this step needs to be executed
      yield put(
        paymentFetchPspsForPaymentIdRequest(paymentState.paymentId.value)
      );
      const responseAction = yield take([
        getType(paymentFetchPspsForPaymentIdSuccess),
        getType(paymentFetchPspsForPaymentIdFailure)
      ]);
      if (isActionOf(paymentFetchPspsForPaymentIdFailure, responseAction)) {
        // this step failed, exit the flow
        return;
      }
      // all is ok, continue to the next step
      continue;
    }

    // finally, we signal the success of the activation flow
    action.payload.onSuccess(
      paymentState.paymentId.value,
      paymentState.psps.value
    );

    // since this is the last step, we exit the flow
    break;
  }
}

/**
 * Main saga entrypoint
 */
export function* watchWalletSaga(
  sessionToken: SessionToken,
  pagoPaClient: PagoPaClient
): Iterator<Effect> {
  // Builds a backend client specifically for the pagopa-proxy endpoints that
  // need a fetch instance that doesn't retry requests and have longer timeout
  const backendClient = BackendClient(
    apiUrlPrefix,
    sessionToken,
    pagopaFetch()
  );

  // Backend client for polling for paymentId - uses an instance of fetch that
  // considers a 404 as a transient error and retries with a constant delay
  const pollingBackendClient = BackendClient(
    apiUrlPrefix,
    sessionToken,
    constantPollingFetch(MAX_RETRIES_POLLING, DELAY_BETWEEN_RETRIES_MS)
  );

  // First thing we do is to ask the pagopa REST APIs for a token we can use
  // to make requests - pagopa REST APIs has their own session.
  // It's fine if this request fails, as all subsequent API calls are wrapped
  // with fetchWithTokenRefresh().
  // Note that fetchAndStorePagoPaToken has a side effect of emitting an action
  // that stores the token in the Redux store.
  // TODO: document this flow
  yield call(fetchAndStorePagoPaToken, pagoPaClient);

  //
  // Sagas
  //

  yield takeLatest(
    getType(runStartOrResumeAddCreditCardSaga),
    startOrResumeAddCreditCardSaga
  );

  yield takeLatest(
    getType(runStartOrResumePaymentSaga),
    startOrResumePaymentSaga
  );

  //
  // API requests
  //

  yield takeLatest(
    getType(fetchTransactionsRequest),
    fetchTransactionsRequestHandler,
    pagoPaClient
  );

  yield takeLatest(
    getType(fetchWalletsRequest),
    fetchWalletsRequestHandler,
    pagoPaClient
  );

  yield takeLatest(
    getType(addWalletCreditCardRequest),
    addWalletCreditCardRequestHandler,
    pagoPaClient
  );

  yield takeLatest(
    getType(payCreditCardVerificationRequest),
    payCreditCardVerificationRequestHandler,
    pagoPaClient
  );

  yield takeLatest(
    getType(paymentUpdateWalletPspRequest),
    updateWalletPspRequestHandler,
    pagoPaClient
  );

  yield takeLatest(
    getType(deleteWalletRequest),
    deleteWalletRequestHandler,
    pagoPaClient
  );

  yield takeLatest(
    getType(paymentVerificaRequest),
    paymentVerificaRequestHandler,
    backendClient.getVerificaRpt
  );

  yield takeLatest(
    getType(paymentAttivaRequest),
    paymentAttivaRequestHandler,
    backendClient.postAttivaRpt
  );

  yield takeLatest(
    getType(paymentIdPollingRequest),
    paymentIdPollingRequestHandler,
    pollingBackendClient.getPaymentId
  );

  yield takeLatest(
    getType(paymentCheckRequest),
    paymentCheckRequestHandler,
    pagoPaClient
  );

  yield takeLatest(
    getType(paymentFetchPspsForPaymentIdRequest),
    paymentFetchPspsForWalletRequestHandler,
    pagoPaClient
  );
}
