// tslint:disable:max-union-size

/**
 * A saga that manages the Wallet.
 */

import { none, Option, some } from "fp-ts/lib/Option";
import {
  AmountInEuroCents,
  RptId,
  RptIdFromString
} from "italia-ts-commons/lib/pagopa";
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
  GetActivationStatusT,
  GetPaymentInfoT
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
  paymentRequestTransactionSummaryFromRptId,
  paymentUpdatePsp,
  paymentVerificaFailure,
  paymentVerificaRequest,
  paymentVerificaSuccess,
  resetPaymentState,
  startPaymentSaga
} from "../store/actions/wallet/payment";
import {
  fetchTransactionsFailure,
  fetchTransactionsRequest,
  fetchTransactionsSuccess
} from "../store/actions/wallet/transactions";
import {
  addCreditCardCompleted,
  addCreditCardRequest,
  creditCardDataCleanup,
  deleteWalletRequest,
  fetchWalletsFailure,
  fetchWalletsRequest,
  fetchWalletsSuccess
} from "../store/actions/wallet/wallets";
import { GlobalState } from "../store/reducers/types";
import { getPagoPaToken } from "../store/reducers/wallet/pagopa";
import { getFavoriteWallet } from "../store/reducers/wallet/wallets";
import {
  paymentCancel,
  paymentFailure,
  paymentRequestCompletion
} from "./../store/actions/wallet/payment";

import { extractNodoError, extractPaymentManagerError } from "../types/errors";
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
import { attivaAndGetPaymentId } from "./wallet/nodo";

function* fetchTransactions(pagoPaClient: PagoPaClient): Iterator<Effect> {
  const response:
    | SagaCallReturnType<typeof pagoPaClient.getTransactions>
    | undefined = yield call(
    fetchWithTokenRefresh,
    pagoPaClient.getTransactions,
    pagoPaClient
  );
  if (response !== undefined && response.status === 200) {
    yield put(fetchTransactionsSuccess(response.value.data));
  } else {
    yield put(fetchTransactionsFailure(new Error("Generic error"))); // FIXME show relevant error (see story below)
  }
  // else show an error modal @https://www.pivotaltracker.com/story/show/159400682
}

function* fetchWallets(
  pagoPaClient: PagoPaClient
): Iterator<Effect | Option<ReadonlyArray<Wallet>>> {
  const response: SagaCallReturnType<
    typeof pagoPaClient.getWallets
  > = yield call(fetchWithTokenRefresh, pagoPaClient.getWallets, pagoPaClient);
  if (response !== undefined && response.status === 200) {
    yield put(fetchWalletsSuccess(response.value.data));
    return some(response.value.data);
  } else {
    yield put(fetchWalletsFailure(new Error("Generic error"))); // FIXME show relevant error (see story below)
  }
  // else show an error modal @https://www.pivotaltracker.com/story/show/159400682
  return none;
}

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
 */
function* addCreditCard(
  pagoPaClient: PagoPaClient,
  action: ActionType<typeof addCreditCardRequest>
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
    yield put(walletManagementSetLoadingState());
    const updatedWallets: SagaCallReturnType<typeof fetchWallets> = yield call(
      fetchWallets,
      pagoPaClient
    );
    yield put(walletManagementResetLoadingState());

    // FIXME: in case the calls to retrieve the wallets fails, we always fail,
    //        but we should retry instead or show an error
    const maybeAddedWallet = updatedWallets
      .map(wx => wx.find(w => w.idWallet === idWallet))
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

function* deleteWallet(
  pagoPaClient: PagoPaClient,
  action: ActionType<typeof deleteWalletRequest>
): Iterator<Effect> {
  try {
    yield put(walletManagementSetLoadingState());
    const apiDeleteWallet = (token: PagopaToken) =>
      pagoPaClient.deleteWallet(token, action.payload);
    const response: SagaCallReturnType<typeof apiDeleteWallet> = yield call(
      fetchWithTokenRefresh,
      apiDeleteWallet,
      pagoPaClient
    );
    if (response !== undefined && response.status === 200) {
      // wallet was successfully deleted
      Toast.show({
        text: I18n.t("wallet.delete.successful"),
        type: "success"
      });
      const wallets: SagaCallReturnType<typeof fetchWallets> = yield call(
        fetchWallets,
        pagoPaClient
      ); // refresh cards list
      if (wallets.isSome() && wallets.value.length > 0) {
        yield put(navigateToWalletList());
      } else {
        yield put(navigateToWalletHome());
      }
    } else {
      // a problem occurred
      Toast.show({
        text: I18n.t("wallet.delete.failed"),
        type: "danger"
      });
    }
  } catch {
    /**
     * TODO: Handle error here
     */
  } finally {
    yield put(walletManagementResetLoadingState());
  }
}

/**
 * This saga is forked at the beginning of a payment flow
 */
function* watchPaymentSaga(
  getVerificaRpt: TypeofApiCall<GetPaymentInfoT>,
  postAttivaRpt: TypeofApiCall<ActivatePaymentT>,
  getPaymentIdApi: TypeofApiCall<GetActivationStatusT>,
  pagoPaClient: PagoPaClient
): Iterator<Effect> {
  while (true) {
    const action:
      | ActionType<typeof paymentRequestTransactionSummaryFromRptId>
      | ActionType<typeof paymentRequestTransactionSummaryFromBanner>
      | ActionType<typeof paymentRequestContinueWithPaymentMethods>
      | ActionType<typeof paymentRequestPickPaymentMethod>
      | ActionType<typeof paymentRequestConfirmPaymentMethod>
      | ActionType<typeof paymentRequestPickPsp>
      | ActionType<typeof paymentUpdatePsp>
      | ActionType<typeof paymentRequestCompletion>
      | ActionType<typeof paymentRequestGoBack>
      | ActionType<typeof paymentRequestCancel>
      | ActionType<typeof resetPaymentState> = yield take([
      getType(paymentRequestTransactionSummaryFromRptId),
      getType(paymentRequestTransactionSummaryFromBanner),
      getType(paymentRequestContinueWithPaymentMethods),
      getType(paymentRequestPickPaymentMethod),
      getType(paymentRequestConfirmPaymentMethod),
      getType(paymentRequestPickPsp),
      getType(paymentUpdatePsp),
      getType(paymentRequestCompletion),
      getType(paymentRequestGoBack),
      getType(paymentRequestCancel),
      getType(resetPaymentState)
    ]);

    if (isActionOf(resetPaymentState, action)) {
      // On payment completed, stop listening for actions
      break;
    }

    switch (action.type) {
      case getType(paymentRequestTransactionSummaryFromRptId): {
        // handle loading of transaction summary (Verifica) from an RPT ID, this
        // can be triggered from a message, a QR code or a manual input
        yield call(
          showTransactionSummaryFromRptIdHandler,
          action,
          getVerificaRpt
        );
        break;
      }
      case getType(paymentRequestTransactionSummaryFromBanner): {
        // FIXME: not clear what triggers this? it looks like the same summary
        //        screen is used after the Verifica and the Attiva?
        yield call(showTransactionSummaryFromBannerHandler);
        break;
      }
      case getType(paymentRequestContinueWithPaymentMethods): {
        // step after the transaction summary
        yield fork(
          continueWithPaymentMethodsHandler,
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
      case getType(paymentUpdatePsp): {
        yield fork(updatePspHandler, action, pagoPaClient);
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

function* showTransactionSummaryFromRptIdHandler(
  action: ActionType<typeof paymentRequestTransactionSummaryFromRptId>,
  getVerificaRpt: TypeofApiCall<GetPaymentInfoT>
) {
  // either the QR code has been read, or the
  // data has been entered manually. Store the
  // payload and proceed with showing the
  // transaction information fetched from the
  // pagoPA proxy

  // First, navigate to the summary screen
  yield put(
    navigateToPaymentTransactionSummaryScreen({
      rptId: action.payload.rptId,
      initialAmount: action.payload.initialAmount,
      maybePaymentId: none
    })
  );

  const { rptId } = action.payload;

  yield put(paymentVerificaRequest());

  try {
    const response: SagaCallReturnType<typeof getVerificaRpt> = yield call(
      getVerificaRpt,
      {
        rptId: RptIdFromString.encode(rptId)
      }
    );
    if (response !== undefined && response.status === 200) {
      // Verifica succeeded
      yield put(paymentVerificaSuccess(response.value));
    } else {
      // Verifica failed
      yield put(paymentVerificaFailure(Error(extractNodoError(response))));
    }
  } catch {
    // Probably a timeout
    yield put(paymentVerificaFailure(Error("GENERIC_ERROR")));
  }
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

function* fetchPspList(
  pagoPaClient: PagoPaClient,
  paymentId: string
): Iterator<Effect | Option<ReadonlyArray<Psp>>> {
  try {
    yield put(paymentPspListRequest());
    const apiGetPspList = (pagoPaToken: PagopaToken) =>
      pagoPaClient.getPspList(pagoPaToken, paymentId);
    const response: SagaCallReturnType<typeof apiGetPspList> = yield call(
      fetchWithTokenRefresh,
      apiGetPspList,
      pagoPaClient
    );
    if (response !== undefined && response.status === 200) {
      yield put(paymentPspListSuccess(response.value));
      return some(response.value.data);
    }
  } catch {
    /**
     * TODO handle error
     */
    // FIXME: again the flow continues ignoring any error
    yield put(paymentPspListFailure(Error("GENERIC_ERROR")));
    return none;
  }
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

function* checkPayment(
  pagoPaClient: PagoPaClient,
  paymentId: string
): Iterator<Effect> {
  try {
    yield put(paymentSetLoadingState());
    // FIXME: we should not use default pagopa client for checkpayment, need to
    //        a client that doesn't retry on failure!!! checkpayment is NOT
    //        idempotent, the 2nd time it will error!
    const apiCheckPayment = (token: PagopaToken) =>
      pagoPaClient.checkPayment(token, paymentId);
    const response: SagaCallReturnType<typeof apiCheckPayment> = yield call(
      fetchWithTokenRefresh,
      apiCheckPayment,
      pagoPaClient
    );
    if (
      response === undefined ||
      (response.status !== 200 && (response.status as number) !== 422)
    ) {
      // TODO: remove the cast of response.status to number as soon as the
      //       paymentmanager specs include the 422 status.
      //       https://www.pivotaltracker.com/story/show/161053093
      yield put(
        paymentFailure(
          extractPaymentManagerError(
            response ? response.value.message : undefined
          )
        )
      );
      // FIXME: in payment failure we must stop the payment process!!!
    }
    // else show an error modal @https://www.pivotaltracker.com/story/show/159400682
  } catch {
    yield put(paymentFailure("GENERIC_ERROR"));
    // FIXME: in payment failure we must stop the payment process!!!
  } finally {
    yield put(paymentResetLoadingState());
  }
}

function* callCheckAndSelectPaymentMethod(
  pagoPaClient: PagoPaClient,
  rptId: RptId,
  initialAmount: AmountInEuroCents,
  verifica: PaymentRequestsGetResponse,
  paymentId: string
) {
  yield call(checkPayment, pagoPaClient, paymentId);
  // FIXME: checkPayment may emit a paymentFailure action but here there is
  //        no check and the payment flow continues, ignoring the error.

  // find out whether a payment method has already
  // been defined as favorite. If so, use it and
  // ask the user to confirm it
  // Otherwise, show a list of payment methods available
  // TODO: if no payment method is available (or if the
  // user chooses to do so), allow adding a new one.
  const maybeFavoriteWallet: ReturnType<
    typeof getFavoriteWallet
  > = yield select<GlobalState>(getFavoriteWallet);

  // redirect as needed
  if (maybeFavoriteWallet.isSome()) {
    yield call(
      confirmPaymentMethodHandler,
      paymentRequestConfirmPaymentMethod({
        rptId,
        initialAmount,
        verifica,
        wallet: maybeFavoriteWallet.value,
        paymentId
      }),
      pagoPaClient
    );
  } else {
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
}

function* continueWithPaymentMethodsHandler(
  action: ActionType<typeof paymentRequestContinueWithPaymentMethods>,
  pagoPaClient: PagoPaClient,
  postAttivaRpt: TypeofApiCall<ActivatePaymentT>,
  getPaymentIdApi: TypeofApiCall<GetActivationStatusT>
) {
  /**
   * get data required to fetch a payment id
   */

  const { rptId, initialAmount, verifica, maybePaymentId } = action.payload;
  const paymentContextCode = verifica.codiceContestoPagamento;
  const currentAmount = AmountToImporto.encode(
    verifica.importoSingoloVersamento
  );

  if (maybePaymentId.isSome()) {
    // if we have a previous payment ID stored in the state from a previous
    // "attiva", continue to select a payment method
    yield call(
      callCheckAndSelectPaymentMethod, // FIXME: we must not do check here, it's not idempotent
      pagoPaClient,
      rptId,
      initialAmount,
      verifica,
      maybePaymentId.value
    );
  } else {
    // or else, do the attiva to get a payment Id
    try {
      yield put(paymentSetLoadingState());
      const result: SagaCallReturnType<
        typeof attivaAndGetPaymentId
      > = yield call(
        attivaAndGetPaymentId,
        postAttivaRpt,
        getPaymentIdApi,
        rptId,
        paymentContextCode,
        currentAmount
      );
      if (result.isRight()) {
        yield call(
          callCheckAndSelectPaymentMethod,
          pagoPaClient,
          rptId,
          initialAmount,
          verifica,
          result.value
        );
      } else {
        yield put(paymentFailure(result.value));
        return;
      }
    } catch {
      yield put(paymentFailure("GENERIC_ERROR"));
      return;
    } finally {
      yield put(paymentResetLoadingState());
    }
  }
}

function* pickPaymentMethodHandler(
  rptId: RptId,
  initialAmount: AmountInEuroCents,
  verifica: PaymentRequestsGetResponse,
  paymentId: string
) {
  // show screen with list of payment methods available
  yield put(
    navigateToPaymentPickPaymentMethodScreen({
      rptId,
      initialAmount,
      verifica,
      paymentId
    })
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

function* updatePspHandler(
  action: ActionType<typeof paymentUpdatePsp>,
  pagoPaClient: PagoPaClient
) {
  // First update the selected wallet (walletId) with the
  // new PSP (action.payload); then request a new list
  // of wallets (which will contain the updated PSP)
  const { wallet, paymentId } = action.payload;

  try {
    yield put(paymentSetLoadingState());
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
        typeof fetchWallets
      > = yield call(fetchWallets, pagoPaClient);
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
              wallet: updatedWallet,
              paymentId
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
      yield put(resetPaymentState());
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

  // Start listening for actions that start the payment flow
  yield takeLatest(
    getType(startPaymentSaga),
    watchPaymentSaga,
    backendClient.getVerificaRpt,
    backendClient.postAttivaRpt,
    pollingBackendClient.getPaymentId,
    pagoPaClient
  );

  // Start listening for requests to fetch the transaction history
  yield takeLatest(
    getType(fetchTransactionsRequest),
    fetchTransactions,
    pagoPaClient
  );

  // Start listening for requests to fetch the wallets from the pagopa profile
  yield takeLatest(getType(fetchWalletsRequest), fetchWallets, pagoPaClient);

  // Start listening for requests to add a credit card to the wallets
  yield takeLatest(getType(addCreditCardRequest), addCreditCard, pagoPaClient);

  // Start listening for requests to delete a wallet
  yield takeLatest(getType(deleteWalletRequest), deleteWallet, pagoPaClient);
}
