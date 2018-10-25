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
  paymentExecutePaymentRequest,
  paymentFetchPspsForPaymentIdRequest,
  paymentIdPollingFailure,
  paymentIdPollingRequest,
  paymentIdPollingSuccess,
  paymentUpdateWalletPspRequest,
  paymentVerificaRequest,
  runStartOrResumePaymentActivationSaga
} from "../store/actions/wallet/payment";
import { fetchTransactionsRequest } from "../store/actions/wallet/transactions";
import {
  addWalletCreditCardFailure,
  addWalletCreditCardRequest,
  addWalletCreditCardSuccess,
  creditCardCheckout3dsRequest,
  creditCardCheckout3dsSuccess,
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
  paymentExecutePaymentRequestHandler,
  paymentFetchPspsForWalletRequestHandler,
  paymentIdPollingRequestHandler,
  paymentVerificaRequestHandler,
  updateWalletPspRequestHandler
} from "./wallet/pagopaApis";

import * as pot from "../types/pot";

/**
 * We will retry for as many times when polling for a payment ID.
 * The total maximum time we are going to wait will be:
 *
 * PAYMENT_ID_MAX_POLLING_RETRIES * PAYMENT_ID_RETRY_DELAY_MILLIS (milliseconds)
 */
const PAYMENT_ID_MAX_POLLING_RETRIES = 180;

/**
 * How much time to wait between retries when polling for a payment ID
 */
const PAYMENT_ID_RETRY_DELAY_MILLIS = 1000;

/**
 * This saga manages the flow for adding a new card.
 *
 * Adding a new card can happen either from the wallet home screen or during the
 * payment process from the payment method selection screen.
 *
 * To board a new card, we must complete the following steps:
 *
 * 1) add the card to the user wallets
 * 2) execute a "fake" payment to validate the card
 * 3) if required, complete the 3DS checkout for the payment in step (2)
 *
 * This saga updates a state for each step, thus it can be run multiple times
 * to resume the flow from the last succesful step (retry behavior).
 *
 * This saga gets run from ConfirmCardDetailsScreen that is also responsible
 * for showing relevant error and loading states to the user based on the
 * potential state of the flow substates (see GlobalState.wallet.wallets).
 *
 */
// tslint:disable-next-line:cognitive-complexity
function* startOrResumeAddCreditCardSaga(
  action: ActionType<typeof runStartOrResumeAddCreditCardSaga>
) {
  // prepare a new wallet (payment method) that describes the credit card we
  // want to add
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

    //
    // First step: add the credit card to the user wallets
    //
    // Note that the new wallet will not be visibile to the user until all the
    // card onboarding steps have been completed.
    //

    if (pot.isNone(state.creditCardAddWallet)) {
      yield put(addWalletCreditCardRequest({ creditcard: creditCardWallet }));
      const responseAction = yield take([
        getType(addWalletCreditCardSuccess),
        getType(addWalletCreditCardFailure)
      ]);
      if (isActionOf(addWalletCreditCardFailure, responseAction)) {
        // this step failed, exit the flow
        if (
          responseAction.payload === "ALREADY_EXISTS" &&
          action.payload.onFailure
        ) {
          // if the card already exists, run onFailure before exiting the flow
          action.payload.onFailure(responseAction.payload);
        }
        return;
      }
      // all is ok, continue to the next step
      continue;
    }

    //
    // Second step: verify the card with a "fake" payment.
    //
    // Note that this is not actually a real payment, the card processor will
    // just lock the amount from the card available credit. The user will not
    // see this transaction in the transaction list and he will not receive
    // any email notification concerning this transaction.
    //

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

    //
    // Third step: process the optional 3ds checkout.
    //
    // The previous payment step may provide a web URL for the 3DS checkout
    // flow that must be completed by the user to authorize the transaction.
    // Even though this step is optional, in practice Pagopa will always
    // require the 3DS checkout for cards that gets added to the wallet.
    //

    const urlCheckout3ds =
      state.creditCardVerification.value.data.urlCheckout3ds;
    const pagoPaToken: Option<PagopaToken> = yield select<GlobalState>(
      getPagoPaToken
    );

    if (pot.isNone(state.creditCardCheckout3ds)) {
      if (urlCheckout3ds !== undefined && pagoPaToken.isSome()) {
        yield put(
          creditCardCheckout3dsRequest({
            urlCheckout3ds,
            pagopaToken: pagoPaToken.value
          })
        );
        yield take(getType(creditCardCheckout3dsSuccess));
        // all is ok, continue to the next step
        continue;
      } else {
        // if there is no need for a 3ds checkout, simulate a success checkout
        // to proceed to the next step
        yield put(creditCardCheckout3dsSuccess("done"));
        continue;
      }
    }

    //
    // Fourth step: verify that the new card exists in the user wallets
    //
    // There currently is no way of determining whether the card has been added
    // successfully from the URL returned in the webview, so the approach here
    // is to fetch the wallets and look for a wallet with the same ID of the
    // wallet we just added.
    // TODO: find a way of finding out the result of the request from the URL
    //
    // FIXME: we may want to trigger a success here and leave the fetching of
    //        the wallets to the caller
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
          action.payload.onSuccess(maybeAddedWallet);
        }
      } else {
        if (action.payload.onFailure) {
          action.payload.onFailure();
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
 *       of each step and proceeed to the next step under certain conditions
 *       (e.g. when resuming a previous payment flow from scratch, some steps
 *       may fail because they are not idempotent, but we could just proceed
 *       to the next step).
 */
// tslint:disable-next-line:cognitive-complexity
function* startOrResumePaymentActivationSaga(
  action: ActionType<typeof runStartOrResumePaymentActivationSaga>
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

    // finally, we signal the success of the activation flow
    action.payload.onSuccess(paymentState.paymentId.value);

    // since this is the last step, we exit the flow
    break;
  }
}

/**
 * Main wallet saga.
 *
 * This saga is responsible for handling actions the mostly correspond to API
 * requests towards the Pagopa "nodo" and the Pagopa "PaymentManager" APIs.
 *
 * This saga gets forked from the startup saga each time the user authenticates
 * and a new PagopaToken gets received from the backend. Infact, the
 * pagoPaClient passed as paramenter to this saga, embeds the PagopaToken.
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
    constantPollingFetch(
      PAYMENT_ID_MAX_POLLING_RETRIES,
      PAYMENT_ID_RETRY_DELAY_MILLIS
    )
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
    getType(runStartOrResumePaymentActivationSaga),
    startOrResumePaymentActivationSaga
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

  yield takeLatest(
    getType(paymentExecutePaymentRequest),
    paymentExecutePaymentRequestHandler,
    pagoPaClient
  );
}
