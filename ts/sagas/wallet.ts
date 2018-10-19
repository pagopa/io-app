// tslint:disable:max-union-size

/**
 * A saga that manages the Wallet.
 */

// import { none, Option } from "fp-ts/lib/Option";
// import { AmountInEuroCents, RptId } from "italia-ts-commons/lib/pagopa";
// import { StackActions } from "react-navigation";
import {
  call,
  Effect,
  put,
  select,
  take,
  takeLatest
} from "redux-saga/effects";
import { ActionType, getType, isActionOf } from "typesafe-actions";

// import { PaymentRequestsGetResponse } from "../../definitions/backend/PaymentRequestsGetResponse";

import { BackendClient } from "../api/backend";
import { PagoPaClient } from "../api/pagopa";
import { apiUrlPrefix } from "../config";
// import I18n from "../i18n";

// import {
//   navigateToWalletCheckout3dsScreen,
//   navigateToWalletHome
// } from "../store/actions/navigation";
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
  // paymentRequestPickPaymentMethod,
  paymentUpdateWalletPspRequest,
  paymentVerificaRequest,
  runStartOrResumePaymentSaga
} from "../store/actions/wallet/payment";
import { fetchTransactionsRequest } from "../store/actions/wallet/transactions";
import {
  // addCreditCardCompleted,
  // creditCardDataCleanup,
  deleteWalletRequest,
  // fetchWalletsFailure,
  fetchWalletsRequest
  // fetchWalletsSuccess,
  // runAddCreditCardSaga
} from "../store/actions/wallet/wallets";
import { GlobalState } from "../store/reducers/types";
// import { getPagoPaToken } from "../store/reducers/wallet/pagopa";
// import { getWalletsByIdOption } from "../store/reducers/wallet/wallets";

// import { NullableWallet, PagopaToken, PayRequest } from "../types/pagopa";
import { SessionToken } from "../types/SessionToken";
// import { SagaCallReturnType } from "../types/utils";

import { constantPollingFetch, pagopaFetch } from "../utils/fetch";

import {
  fetchAndStorePagoPaToken
  // fetchWithTokenRefresh
} from "./wallet/utils";

// import { TranslationKeys } from "../../locales/locales";
import {
  deleteWalletRequestHandler,
  fetchTransactionsRequestHandler,
  fetchWalletsRequestHandler,
  paymentAttivaRequestHandler,
  paymentCheckRequestHandler,
  paymentFetchPspsForWalletRequestHandler,
  paymentIdPollingRequestHandler,
  paymentVerificaRequestHandler,
  updateWalletPspRequestHandler
} from "./wallet/pagopaApis";

import * as pot from "../types/pot";

/*
function* onAddCreditCardDone(
  isSuccess: boolean,
  message: Option<TranslationKeys>,
  inPayment: Option<{
    rptId: RptId;
    initialAmount: AmountInEuroCents;
    verifica: PaymentRequestsGetResponse;
    paymentId: string;
  }>
): IterableIterator<Effect> {
  // if result is success, show a success message, or else, show the failure
  // message if provided or fall back to default failure message
  const toastText = isSuccess
    ? "wallet.newPaymentMethod.successful"
    : message.getOrElse("wallet.newPaymentMethod.failed");
  const toastType = isSuccess ? "success" : "danger";

  showToast(I18n.t(toastText), toastType);

  // TODO: this should use StackActions.reset
  // to reset the navigation. Right now, the
  // "back" option is not allowed -- so the user cannot
  // get back to previous screens, but the navigation
  // stack should be cleaned right here
  // @https://www.pivotaltracker.com/story/show/159300579
  const nextStepAction = inPayment.isSome()
    ? paymentRequestPickPaymentMethod({
        rptId: inPayment.value.rptId,
        initialAmount: inPayment.value.initialAmount,
        verifica: inPayment.value.verifica,
        paymentId: inPayment.value.paymentId
      })
    : navigateToWalletHome();

  // navigate to the next action
  yield put(nextStepAction);
  // Wait for the navigation transition to complete, in order to avoid
  // to see the card's placeholder data.
  yield take(StackActions.COMPLETE_TRANSITION);

  // cleanup credit card data from the redux state
  yield put(creditCardDataCleanup());
}
*/

/**
 * This saga manages the flow for adding a new card.
 *
 * Adding a new card can happen either from the wallet home screen or during the
 * payment process from the payment method selection screen.
 *
 * Run from ConfirmCardDetailsScreen
 */
/*
function* addCreditCardSaga(
  pagoPaClient: PagoPaClient,
  action: ActionType<typeof runAddCreditCardSaga>
): Iterator<Effect> {
  const wallet: NullableWallet = {
    idWallet: null,
    type: "CREDIT_CARD",
    favourite: action.payload.setAsFavorite,
    creditCard: action.payload.creditCard,
    psp: undefined
  };
  // 1st call: boarding credit card
  try {
    const boardCreditCard = (token: PagopaToken) =>
      pagoPaClient.boardCreditCard(token, wallet);
    yield put(walletManagementSetLoadingState());
    const responseBoardCC: SagaCallReturnType<
      typeof boardCreditCard
    > = yield call(fetchWithTokenRefresh, boardCreditCard, pagoPaClient);
    yield put(walletManagementResetLoadingState());

    const failedCardAlreadyExists =
      typeof responseBoardCC !== "undefined" &&
      responseBoardCC.status === 422 &&
      responseBoardCC.value.message === "creditcard.already_exists";


    // Failed request. show an error (TODO) and return
    // @https://www.pivotaltracker.com/story/show/160521051

    if (
      failedCardAlreadyExists ||
      typeof responseBoardCC === "undefined" ||
      responseBoardCC.status !== 200
    ) {
      yield call(onAddCreditCardDone, false, none, action.payload.inPayment);
      return;
    }

    // 1st call was successful. Proceed with the 2nd one
    // (boarding pay)
    const { idWallet } = responseBoardCC.value.data;
    const payRequest: PayRequest = {
      data: {
        idWallet,
        tipo: "web",
        cvv: wallet.creditCard.securityCode
          ? wallet.creditCard.securityCode
          : undefined
      }
    };
    const boardPay = (token: PagopaToken) =>
      pagoPaClient.boardPay(token, payRequest);
    yield put(walletManagementSetLoadingState());
    const responseBoardPay: SagaCallReturnType<typeof boardPay> = yield call(
      fetchWithTokenRefresh,
      boardPay,
      pagoPaClient
    );
    yield put(walletManagementResetLoadingState());


    // Failed request. show an error (TODO) and return

    if (responseBoardPay === undefined || responseBoardPay.status !== 200) {
      // FIXME: we should not navigate to the wallet home in case we're inside
      //        a payment, instead we should go pack to the payment method
      //        selection screen.
      yield call(onAddCreditCardDone, false, none, action.payload.inPayment);
      return;
    }
    const url = responseBoardPay.value.data.urlCheckout3ds;
    const pagoPaToken: Option<PagopaToken> = yield select<GlobalState>(
      getPagoPaToken
    );
    if (url === undefined || pagoPaToken.isNone()) {
      // pagoPA is *always* supposed to pass a URL
      // for the app to open. if it is not there,
      // exit with an error (TODO)
      return;
    }
    // a valid URL has been made available
    // from pagoPA and needs to be opened in a webview
    const urlWithToken = `${url}&sessionToken=${pagoPaToken.value}`;
    yield put(
      navigateToWalletCheckout3dsScreen({
        url: urlWithToken
      })
    );


    // Wait for the webview to do its thing
    // (will trigger an addCreditCardCompleted
    // action upon finishing)

    yield take(getType(addCreditCardCompleted));

    // There currently is no way of determining whether the card has been added
    // successfully from the URL returned in the webview, so the approach here
    // is to fetch the wallets and look for a wallet with the same ID of the
    // wallet we just added.
    // TODO: find a way of finding out the result of the request from the URL
    yield put(fetchWalletsRequest());
    yield take([getType(fetchWalletsSuccess), getType(fetchWalletsFailure)]);
    const updatedWallets: ReturnType<
      typeof getWalletsByIdOption
    > = yield select<GlobalState>(getWalletsByIdOption);

    // FIXME: in case the calls to retrieve the wallets fails, we always fail,
    //        but we should retry instead or show an error
    const maybeAddedWallet = updatedWallets
      .mapNullable(wx => wx[idWallet])
      .toUndefined();


    // TODO: introduce a better way of displaying
    // info messages (e.g. red/green banner at the
    // top of the screen)

    if (maybeAddedWallet !== undefined) {
      yield call(onAddCreditCardDone, true, none, action.payload.inPayment);
    } else {
      yield call(onAddCreditCardDone, false, none, action.payload.inPayment);
    }
  } catch {
    yield put(walletManagementResetLoadingState());
    yield call(onAddCreditCardDone, false, none, action.payload.inPayment);
  }
}
*/

const MAX_RETRIES_POLLING = 180;
const DELAY_BETWEEN_RETRIES_MS = 1000;

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

  // yield takeLatest(
  //   getType(runAddCreditCardSaga),
  //   addCreditCardSaga,
  //   pagoPaClient
  // );

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
