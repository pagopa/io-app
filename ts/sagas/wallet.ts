// tslint:disable:max-union-size

/**
 * A saga that manages the Wallet.
 */

import { none, Option, some } from "fp-ts/lib/Option";
import { AmountInEuroCents, RptId } from "italia-ts-commons/lib/pagopa";
import { TypeofApiCall } from "italia-ts-commons/lib/requests";
import { Toast } from "native-base";
import { NavigationActions, StackActions } from "react-navigation";
import {
  call,
  Effect,
  fork,
  put,
  select,
  take,
  takeLatest
} from "redux-saga/effects";
import { ActionType, getType, isActionOf } from "typesafe-actions";

import { PaymentRequestsGetResponse } from "../../definitions/backend/PaymentRequestsGetResponse";
import {
  ActivatePaymentT,
  GetActivationStatusT
} from "../../definitions/backend/requestTypes";

import { BackendClient } from "../api/backend";
import { PagoPaClient } from "../api/pagopa";
import { apiUrlPrefix } from "../config";
import I18n from "../i18n";

import {
  navigateToPaymentConfirmPaymentMethodScreen,
  navigateToPaymentPickPaymentMethodScreen,
  navigateToPaymentPickPspScreen,
  navigateToPaymentTransactionSummaryScreen,
  navigateToTransactionDetailsScreen,
  navigateToWalletCheckout3dsScreen,
  navigateToWalletHome,
  navigateToWalletList
} from "../store/actions/navigation";
import {
  goBackOnePaymentState,
  paymentAttivaRequest,
  paymentIdPollingRequest,
  paymentPspListFailure,
  paymentPspListRequest,
  paymentPspListSuccess,
  paymentRequestCancel,
  paymentRequestConfirmPaymentMethod,
  paymentRequestContinueWithPaymentMethods,
  paymentRequestGoBack,
  paymentRequestPickPaymentMethod,
  paymentRequestPickPsp,
  paymentRequestTransactionSummaryFromBanner,
  paymentUpdateWalletPsp,
  paymentVerificaRequest,
  paymentCheckRequest,
  paymentAttivaSuccess,
  paymentAttivaFailure,
  paymentIdPollingSuccess,
  paymentIdPollingFailure,
  paymentCheckSuccess,
  paymentCheckFailure,
  runStartOrResumePaymentSaga,
  paymentFetchPspsForPaymentIdRequest
} from "../store/actions/wallet/payment";
import { fetchTransactionsRequest } from "../store/actions/wallet/transactions";
import {
  addCreditCardCompleted,
  creditCardDataCleanup,
  deleteWalletFailure,
  deleteWalletRequest,
  deleteWalletSuccess,
  fetchWalletsFailure,
  fetchWalletsRequest,
  fetchWalletsSuccess,
  runAddCreditCardSaga,
  runDeleteWalletSaga
} from "../store/actions/wallet/wallets";
import { GlobalState } from "../store/reducers/types";
import { getPagoPaToken } from "../store/reducers/wallet/pagopa";
import {
  getFavoriteWallet,
  getWalletsByIdOption,
  getWalletsOption
} from "../store/reducers/wallet/wallets";
import {
  paymentCancel,
  paymentFailure,
  paymentRequestCompletion
} from "./../store/actions/wallet/payment";

import { extractPaymentManagerError } from "../types/errors";
import {
  NullableWallet,
  PagopaToken,
  PayRequest,
  Psp,
  Wallet
} from "../types/pagopa";
import { SessionToken } from "../types/SessionToken";
import { SagaCallReturnType } from "../types/utils";

import { constantPollingFetch, pagopaFetch } from "../utils/fetch";

import {
  fetchAndStorePagoPaToken,
  fetchWithTokenRefresh
} from "./wallet/utils";

import { AmountToImporto } from "../utils/amounts";
import { showToast } from "../utils/showToast";

import { TranslationKeys } from "../../locales/locales";
import {
  deleteWalletRequestHandler,
  fetchTransactionsRequestHandler,
  fetchWalletsRequestHandler,
  paymentAttivaRequestHandler,
  paymentCheckRequestHandler,
  paymentIdPollingRequestHandler,
  paymentVerificaRequestHandler,
  paymentFetchPspsForWalletRequestHandler
} from "./wallet/pagopaApis";

import * as pot from "../types/pot";

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

/**
 * This saga manages the flow for adding a new card.
 *
 * Adding a new card can happen either from the wallet home screen or during the
 * payment process from the payment method selection screen.
 *
 * Run from ConfirmCardDetailsScreen
 */
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

    /**
     * Failed request. show an error (TODO) and return
     * @https://www.pivotaltracker.com/story/show/160521051
     */
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

    /**
     * Failed request. show an error (TODO) and return
     */
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

    /**
     * Wait for the webview to do its thing
     * (will trigger an addCreditCardCompleted
     * action upon finishing)
     */
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

    /**
     * TODO: introduce a better way of displaying
     * info messages (e.g. red/green banner at the
     * top of the screen)
     */
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

/**
 * A saga that implements the logic for deleting a wallet.
 */
function* deleteWalletSaga(
  action: ActionType<typeof runDeleteWalletSaga>
): Iterator<Effect> {
  yield put(deleteWalletRequest(action.payload));
  const deleteWalletResultAction = yield take([
    getType(deleteWalletSuccess),
    getType(deleteWalletFailure)
  ]);

  if (isActionOf(deleteWalletSuccess, deleteWalletResultAction)) {
    // wallet was successfully deleted
    Toast.show({
      text: I18n.t("wallet.delete.successful"),
      type: "success"
    });

    const updatedWallets: ReturnType<typeof getWalletsOption> = yield select<
      GlobalState
    >(getWalletsOption);

    if (updatedWallets.isSome() && updatedWallets.value.length > 0) {
      yield put(navigateToWalletList());
    } else {
      yield put(navigateToWalletHome());
    }
  } else {
    Toast.show({
      text: I18n.t("wallet.delete.failed"),
      type: "danger"
    });
  }
}

/**
 * This saga is forked at the beginning of a payment flow
 */
function* watchPaymentSaga(
  postAttivaRpt: TypeofApiCall<ActivatePaymentT>,
  getPaymentIdApi: TypeofApiCall<GetActivationStatusT>,
  pagoPaClient: PagoPaClient
): Iterator<Effect> {
  while (true) {
    const action:
      | ActionType<typeof paymentRequestTransactionSummaryFromBanner>
      | ActionType<typeof paymentRequestContinueWithPaymentMethods>
      | ActionType<typeof paymentRequestPickPaymentMethod>
      | ActionType<typeof paymentRequestConfirmPaymentMethod>
      | ActionType<typeof paymentRequestPickPsp>
      | ActionType<typeof paymentUpdateWalletPsp>
      | ActionType<typeof paymentRequestCompletion>
      | ActionType<typeof paymentRequestGoBack>
      | ActionType<typeof paymentRequestCancel> = yield take([
      getType(paymentRequestTransactionSummaryFromBanner),
      getType(paymentRequestContinueWithPaymentMethods),
      getType(paymentRequestPickPaymentMethod),
      getType(paymentRequestConfirmPaymentMethod),
      getType(paymentRequestPickPsp),
      getType(paymentUpdateWalletPsp),
      getType(paymentRequestCompletion),
      getType(paymentRequestGoBack),
      getType(paymentRequestCancel)
    ]);

    switch (action.type) {
      case getType(paymentRequestTransactionSummaryFromBanner): {
        // FIXME: not clear what triggers this? it looks like the same summary
        //        screen is used after the Verifica and the Attiva?
        yield call(showTransactionSummaryFromBannerHandler);
        break;
      }
      case getType(paymentRequestContinueWithPaymentMethods): {
        // step after the transaction summary
        yield fork(
          continueWithPaymentMethodsSaga,
          action,
          pagoPaClient,
          postAttivaRpt,
          getPaymentIdApi
        );
        break;
      }
      case getType(paymentRequestPickPaymentMethod): {
        yield fork(
          pickPaymentMethodHandler,
          action.payload.rptId,
          action.payload.initialAmount,
          action.payload.verifica,
          action.payload.paymentId
        );
        break;
      }
      case getType(paymentRequestConfirmPaymentMethod): {
        yield fork(confirmPaymentMethodHandler, action, pagoPaClient);
        break;
      }
      case getType(paymentRequestPickPsp): {
        yield fork(pickPspHandler, action);
        break;
      }
      case getType(paymentUpdateWalletPsp): {
        yield fork(updateWalletPspHandler, action, pagoPaClient);
        break;
      }
      case getType(paymentRequestCompletion): {
        yield fork(completionHandler, action, pagoPaClient);
        break;
      }
      case getType(paymentRequestGoBack): {
        yield fork(goBackHandler, action, pagoPaClient);
        break;
      }
      case getType(paymentRequestCancel): {
        yield fork(cancelPaymentHandler, action);
        break;
      }
    }
  }
}

function* cancelPaymentHandler(_: ActionType<typeof paymentRequestCancel>) {
  yield put(paymentCancel()); // empty the stack
  // FIXME: if coming from a message, should navigate back to the message
  yield put(navigateToWalletHome());
}

function* goBackHandler(_: ActionType<typeof paymentRequestGoBack>) {
  yield put(goBackOnePaymentState()); // return to previous state
  yield put(NavigationActions.back());
}

function* showTransactionSummaryFromBannerHandler() {
  yield put(navigateToPaymentTransactionSummaryScreen());
}

/**
 * Whether we need to show the PSP selection screen to the user.
 */
function shouldShowPspList(wallet: Wallet, psps: ReadonlyArray<Psp>): boolean {
  if (psps.length === 1) {
    // only one PSP, no need to show the PSP selection screen
    return false;
  }

  const walletPsp = wallet.psp;

  if (walletPsp === undefined) {
    // there is no PSP associated to this payment method (wallet), we should
    // show the PSP selection screen
    return true;
  }

  // look for the PSP associated with the wallet in the list of PSPs returned
  // by pagopa
  const walletPspInPsps = psps.find(psp => psp.id === walletPsp.id);

  // if the selected PSP is not available anymore, so show the PSP selection
  // screen
  return walletPspInPsps === undefined;
}

function* confirmPaymentMethodHandler(
  action: ActionType<typeof paymentRequestConfirmPaymentMethod>,
  pagoPaClient: PagoPaClient
): Iterator<Effect> {
  const maybePspList: Option<ReadonlyArray<Psp>> = yield call(
    fetchPspList,
    pagoPaClient,
    action.payload.paymentId
  );
  if (maybePspList.isNone()) {
    yield put(paymentFailure("GENERIC_ERROR"));
    // FIXME: this is not a fatal error, instead we should allow a retry
    return;
  }

  const pspList = maybePspList.value;

  // show card
  // if multiple psps are available and one
  // has not yet been selected, show psp list
  if (shouldShowPspList(action.payload.wallet, pspList)) {
    // multiple choices here and no favorite psp exists (or one exists
    // and it is not available for this payment)
    // show list of psps
    yield put(
      navigateToPaymentPickPspScreen({
        rptId: action.payload.rptId,
        initialAmount: action.payload.initialAmount,
        verifica: action.payload.verifica,
        wallet: action.payload.wallet,
        pspList,
        paymentId: action.payload.paymentId
      })
    );
  } else {
    // only 1 choice of psp, or psp already selected (in previous transaction)
    yield put(
      navigateToPaymentConfirmPaymentMethodScreen({
        rptId: action.payload.rptId,
        initialAmount: action.payload.initialAmount,
        verifica: action.payload.verifica,
        paymentId: action.payload.paymentId,
        wallet: action.payload.wallet,
        pspList
      })
    );
  }
}

const MAX_RETRIES_POLLING = 180;
const DELAY_BETWEEN_RETRIES_MS = 1000;

function* selectPaymentMethodSaga(
  pagoPaClient: PagoPaClient,
  rptId: RptId,
  initialAmount: AmountInEuroCents,
  verifica: PaymentRequestsGetResponse,
  paymentId: string
) {
  // no favorite wallet selected
  // show list
  yield call(
    pickPaymentMethodHandler,
    rptId,
    initialAmount,
    verifica,
    paymentId
  );
}

function* pickPspHandler(action: ActionType<typeof paymentRequestPickPsp>) {
  const { wallet, pspList, paymentId } = action.payload;

  yield put(
    navigateToPaymentPickPspScreen({
      wallet,
      pspList,
      paymentId,
      rptId: action.payload.rptId,
      initialAmount: action.payload.initialAmount,
      verifica: action.payload.verifica
    })
  );
}

/**
 * Updates a Wallet with a new favorite PSP
 */
function* updateWalletPspHandler(
  action: ActionType<typeof paymentUpdateWalletPsp>,
  pagoPaClient: PagoPaClient
) {
  // First update the selected wallet (walletId) with the
  // new PSP (action.payload); then request a new list
  // of wallets (which will contain the updated PSP)
  const { wallet } = action.payload;

  try {
    yield put(fetchWalletsRequest());
    const apiUpdateWalletPsp = (pagoPaToken: PagopaToken) =>
      pagoPaClient.updateWalletPsp(pagoPaToken, wallet.idWallet, {
        data: { idPsp: action.payload.pspId }
      });
    const response: SagaCallReturnType<typeof apiUpdateWalletPsp> = yield call(
      fetchWithTokenRefresh,
      apiUpdateWalletPsp,
      pagoPaClient
    );

    if (response !== undefined && response.status === 200) {
      // request new wallets (expecting to get the
      // same ones as before, with the selected one's
      // PSP set to the new one)
      const maybeUpdatedWallets: SagaCallReturnType<
        typeof fetchWalletsRequestHandler
      > = yield call(fetchWalletsRequestHandler, pagoPaClient);

      if (maybeUpdatedWallets.isSome()) {
        // we got an updated list of wallets, look for the wallet we just updated
        const updatedWallet = maybeUpdatedWallets.value.find(
          _ => _.idWallet === wallet.idWallet
        );
        if (updatedWallet) {
          yield put(
            paymentRequestConfirmPaymentMethod({
              rptId: action.payload.rptId,
              initialAmount: action.payload.initialAmount,
              verifica: action.payload.verifica,
              paymentId: action.payload.paymentId,
              wallet: updatedWallet
            })
          );
        }
        // FIXME: uhmm we just updated a wallet but the wallet is now gone
        //        right now we do nothing, letting the user retry
        // TODO: show a toast
      }
      // in case fetchwallets fail we stay on the same screen, perhaps we just
      // neeed to show a toast
      // TODO: show a toast, asking to retry
    } else {
      yield put(
        paymentFailure(
          extractPaymentManagerError(
            response ? response.value.message : undefined
          )
        )
      );
    }
  } catch {
    yield put(paymentFailure("GENERIC_ERROR"));
  } finally {
    yield put(paymentResetLoadingState());
  }
}

function* completionHandler(
  action: ActionType<typeof paymentRequestCompletion>,
  pagoPaClient: PagoPaClient
) {
  // -> it should proceed with the required operations
  // and terminate with the "new payment" screen

  const { wallet, paymentId } = action.payload;

  try {
    yield put(paymentSetLoadingState());
    const apiPostPayment = (pagoPaToken: PagopaToken) =>
      pagoPaClient.postPayment(pagoPaToken, paymentId, {
        data: { tipo: "web", idWallet: wallet.idWallet }
      });
    const response: SagaCallReturnType<typeof apiPostPayment> = yield call(
      fetchWithTokenRefresh,
      apiPostPayment,
      pagoPaClient
    );

    if (response !== undefined && response.status === 200) {
      // request all transactions (expecting to get the
      // same ones as before, plus the newly created one
      // (the reason for this is because newTransaction contains
      // a payment with status "processing", while the
      // value returned here contains the "completed" status
      // upon successful payment
      const newTransaction = response.value.data;
      yield call(fetchTransactions, pagoPaClient);
      // FIXME: fetchTransactions could fail

      yield put(
        navigateToTransactionDetailsScreen({
          transaction: newTransaction,
          isPaymentCompletedTransaction: true
        })
      );
      //
      // PAYMENT IS COMPLETED
      //
    } else {
      yield put(
        paymentFailure(
          extractPaymentManagerError(
            response ? response.value.message : undefined
          )
        )
      );
    }
  } catch {
    yield put(paymentFailure("GENERIC_ERROR"));
  } finally {
    yield put(paymentResetLoadingState());
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

    // finally, we signal the success of the activation flow
    action.payload.onSuccess(paymentState.paymentId.value);

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
    getType(runAddCreditCardSaga),
    addCreditCardSaga,
    pagoPaClient
  );

  yield takeLatest(getType(runDeleteWalletSaga), deleteWalletSaga);

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
