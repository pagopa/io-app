// tslint:disable:max-union-size

/**
 * A saga that manages the Wallet.
 */

import { Either, left, right } from "fp-ts/lib/Either";
import { none, Option, some } from "fp-ts/lib/Option";
import { RptIdFromString } from "italia-ts-commons/lib/pagopa";
import { AmountInEuroCents, RptId } from "italia-ts-commons/lib/pagopa";
import {
  TypeofApiCall,
  TypeofApiResponse
} from "italia-ts-commons/lib/requests";
import { Toast } from "native-base";
import { NavigationActions } from "react-navigation";
import {
  call,
  Effect,
  fork,
  put,
  race,
  select,
  take,
  takeLatest
} from "redux-saga/effects";
import { ActionType, getType, isActionOf } from "typesafe-actions";

import { CodiceContestoPagamento } from "../../definitions/backend/CodiceContestoPagamento";
import {
  ActivatePaymentT,
  GetActivationStatusT,
  GetPaymentInfoT
} from "../../definitions/backend/requestTypes";

import { BackendClient } from "../api/backend";
import { PagoPaClient } from "../api/pagopa";
import { apiUrlPrefix } from "../config";
import I18n from "../i18n";
import ROUTES from "../navigation/routes";

import {
  goBackOnePaymentState,
  paymentRequestCancel,
  paymentRequestConfirmPaymentMethod,
  paymentRequestContinueWithPaymentMethods,
  paymentRequestGoBack,
  paymentRequestPickPaymentMethod,
  paymentRequestPickPsp,
  paymentRequestPinLogin,
  paymentRequestTransactionSummaryFromBanner,
  paymentRequestTransactionSummaryFromRptId,
  paymentResetLoadingState,
  paymentSetLoadingState,
  paymentUpdatePsp,
  resetPaymentState,
  setPaymentStateFromSummaryToConfirmPaymentMethod,
  setPaymentStateFromSummaryToPickPsp,
  setPaymentStateToConfirmPaymentMethod,
  setPaymentStateToPickPaymentMethod,
  setPaymentStateToPickPsp,
  setPaymentStateToSummary,
  setPaymentStateToSummaryWithPaymentId,
  startPaymentSaga
} from "../store/actions/wallet/payment";
import {
  fetchTransactionsFailure,
  fetchTransactionsRequest,
  fetchTransactionsSuccess,
  selectTransactionForDetails
} from "../store/actions/wallet/transactions";
import {
  addCreditCardCompleted,
  addCreditCardRequest,
  creditCardDataCleanup,
  deleteWalletRequest,
  fetchWalletsFailure,
  fetchWalletsRequest,
  fetchWalletsSuccess,
  selectWalletForDetails,
  walletManagementResetLoadingState,
  walletManagementSetLoadingState
} from "../store/actions/wallet/wallets";
import { GlobalState } from "../store/reducers/types";
import { getPagoPaToken } from "../store/reducers/wallet/pagopa";
import { getPaymentIdFromGlobalState } from "../store/reducers/wallet/payment";
import {
  getFavoriteWallet,
  walletCountSelector
} from "../store/reducers/wallet/wallets";
import {
  paymentCancel,
  paymentFailure,
  paymentRequestCompletion,
  setPaymentStateToPinLogin
} from "./../store/actions/wallet/payment";

import {
  extractNodoError,
  extractPaymentManagerError,
  NodoErrors
} from "../types/errors";
import {
  NullableWallet,
  PagopaToken,
  PayRequest,
  Psp,
  Wallet
} from "../types/pagopa";
import { PinString } from "../types/PinString";
import { SessionToken } from "../types/SessionToken";
import { SagaCallReturnType } from "../types/utils";

import { amountToImportoWithFallback } from "../utils/amounts";
import { constantPollingFetch, pagopaFetch } from "../utils/fetch";

import { loginWithPinSaga } from "./startup/pinLoginSaga";
import { watchPinResetSaga } from "./startup/watchPinResetSaga";

import {
  fetchAndStorePagoPaToken,
  fetchWithTokenRefresh
} from "./wallet/utils";

import { PaymentActivationsPostResponse } from "../../definitions/backend/PaymentActivationsPostResponse";

const navigateTo = (routeName: string, params?: object) => {
  return NavigationActions.navigate({ routeName, params });
};

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
): Iterator<Effect | number | undefined> {
  const response: SagaCallReturnType<
    typeof pagoPaClient.getWallets
  > = yield call(fetchWithTokenRefresh, pagoPaClient.getWallets, pagoPaClient);
  if (response !== undefined && response.status === 200) {
    yield put(fetchWalletsSuccess(response.value.data));
    return response.value.data.length;
  } else {
    yield put(fetchWalletsFailure(new Error("Generic error"))); // FIXME show relevant error (see story below)
  }
  // else show an error modal @https://www.pivotaltracker.com/story/show/159400682
  return undefined;
}

function* addCreditCard(
  pagoPaClient: PagoPaClient,
  action: ActionType<typeof addCreditCardRequest>
): Iterator<Effect> {
  try {
    yield put(walletManagementSetLoadingState());
    const wallet: NullableWallet = {
      idWallet: null,
      type: "CREDIT_CARD",
      favourite: null,
      creditCard: action.payload.creditCard,
      psp: undefined
    };
    // 1st call: boarding credit card
    const boardCreditCard = (token: PagopaToken) =>
      pagoPaClient.boardCreditCard(token, wallet);
    const responseBoardCC: SagaCallReturnType<
      typeof boardCreditCard
    > = yield call(fetchWithTokenRefresh, boardCreditCard, pagoPaClient);

    /**
     * Failed request. show an error (TODO) and return
     * @https://www.pivotaltracker.com/story/show/160521051
     */
    if (responseBoardCC === undefined || responseBoardCC.status !== 200) {
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
    const responseBoardPay: SagaCallReturnType<typeof boardPay> = yield call(
      fetchWithTokenRefresh,
      boardPay,
      pagoPaClient
    );
    /**
     * Failed request. show an error (TODO) and return
     */
    if (responseBoardPay === undefined || responseBoardPay.status !== 200) {
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
      navigateTo(ROUTES.WALLET_CHECKOUT_3DS_SCREEN, {
        url: urlWithToken
      })
    );
  } catch {
    /**
     * TODO handle errors
     */
  } finally {
    yield put(walletManagementResetLoadingState());
  }

  /**
   * Wait for the webview to do its thing
   * (will trigger an addCreditCardCompleted
   * action upon finishing)
   */
  yield take(getType(addCreditCardCompleted));

  // There currently is no way of determining
  // whether the card has been added successfully from
  // the URL returned in the webview, so the approach here
  // is: count current number of cards, refresh cards,
  // check if new number of cards is previous number + 1.
  // If so, the card has been added.
  // TODO: find a way of finding out the result of the
  // request from the URL
  const currentCount: number = yield select<GlobalState>(walletCountSelector);
  const updatedCount: number | undefined = yield call(
    fetchWallets,
    pagoPaClient
  );
  /**
   * TODO: introduce a better way of displaying
   * info messages (e.g. red/green banner at the
   * top of the screen)
   */
  if (updatedCount !== undefined && updatedCount === currentCount + 1) {
    Toast.show({
      text: I18n.t("wallet.newPaymentMethod.successful"),
      type: "success"
    });
  } else {
    Toast.show({
      text: I18n.t("wallet.newPaymentMethod.failed"),
      type: "danger"
    });
  }
  yield put(creditCardDataCleanup());

  // TODO: this should use StackActions.reset
  // to reset the navigation. Right now, the
  // "back" option is not allowed -- so the user cannot
  // get back to previous screens, but the navigation
  // stack should be cleaned right here
  // @https://www.pivotaltracker.com/story/show/159300579
  yield put(navigateTo(ROUTES.WALLET_HOME));
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
      const count: number | undefined = yield call(fetchWallets, pagoPaClient); // refresh cards list
      if (count !== undefined && count > 0) {
        yield put(navigateTo(ROUTES.WALLET_LIST));
      } else {
        yield put(navigateTo(ROUTES.WALLET_HOME));
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
  pagoPaClient: PagoPaClient,
  storedPin: PinString
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
      | ActionType<typeof resetPaymentState>
      | ActionType<typeof paymentRequestPinLogin> = yield take([
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
      getType(paymentRequestPinLogin),
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
        yield fork(pickPaymentMethodHandler, action.payload.paymentId);
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
      case getType(paymentRequestPinLogin): {
        yield fork(pinLoginHandler, action, storedPin);
        break;
      }
    }
  }
}

function* cancelPaymentHandler(_: ActionType<typeof paymentRequestCancel>) {
  yield put(paymentCancel()); // empty the stack
  yield put(navigateTo(ROUTES.WALLET_HOME));
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
  yield put(navigateTo(ROUTES.PAYMENT_TRANSACTION_SUMMARY));

  const { rptId, initialAmount } = action.payload;

  yield put(paymentSetLoadingState());

  try {
    const response: SagaCallReturnType<typeof getVerificaRpt> = yield call(
      getVerificaRpt,
      {
        rptId: RptIdFromString.encode(rptId)
      }
    );
    if (response !== undefined && response.status === 200) {
      // Verifica succeeded
      yield put(setPaymentStateToSummary(rptId, initialAmount, response.value));
    } else {
      // Verifica failed
      yield put(paymentFailure(extractNodoError(response)));
    }
  } catch {
    // Probably a timeout
    yield put(paymentFailure("GENERIC_ERROR"));
  } finally {
    yield put(paymentResetLoadingState());
  }
}

function* showTransactionSummaryFromBannerHandler() {
  yield put(setPaymentStateToSummaryWithPaymentId());
  yield put(navigateTo(ROUTES.PAYMENT_TRANSACTION_SUMMARY));
}

function* showConfirmPaymentMethod(
  paymentIdOrUndefined: string | undefined,
  wallet: Wallet,
  pspList: ReadonlyArray<Psp>
) {
  yield put(
    paymentIdOrUndefined === undefined
      ? setPaymentStateToConfirmPaymentMethod(wallet, pspList)
      : setPaymentStateFromSummaryToConfirmPaymentMethod(
          wallet,
          pspList,
          paymentIdOrUndefined
        )
  );
  yield put(navigateTo(ROUTES.PAYMENT_CONFIRM_PAYMENT_METHOD));
}

function* showPickPsp(
  paymentId: string,
  wallet: Wallet,
  pspList: ReadonlyArray<Psp>
) {
  yield put(setPaymentStateFromSummaryToPickPsp(wallet, pspList, paymentId));
  yield put(navigateTo(ROUTES.PAYMENT_PICK_PSP));
}

const shouldShowPspList = (
  wallet: Wallet,
  pspList: ReadonlyArray<Psp>
): boolean =>
  pspList.length > 1 &&
  (wallet.psp === undefined ||
    pspList.filter(
      p => wallet.psp !== undefined && p.id === wallet.psp.id // check for "undefined" only used to correctly typeguard
    ).length === undefined);

function* fetchPspList(
  pagoPaClient: PagoPaClient,
  paymentId: string
): Iterator<Effect | Option<ReadonlyArray<Psp>>> {
  try {
    yield put(paymentSetLoadingState());
    const apiGetPspList = (pagoPaToken: PagopaToken) =>
      pagoPaClient.getPspList(pagoPaToken, paymentId);
    const response: SagaCallReturnType<typeof apiGetPspList> = yield call(
      fetchWithTokenRefresh,
      apiGetPspList,
      pagoPaClient
    );
    if (response !== undefined && response.status === 200) {
      return some(response.value.data);
    }
  } catch {
    /**
     * TODO handle error
     */
    // FIXME: again the flow continues ignoring any error
    return none;
  } finally {
    yield put(paymentResetLoadingState());
  }
}

function* showWalletOrSelectPsp(
  pagoPaClient: PagoPaClient,
  wallet: Wallet,
  paymentId: string
): Iterator<Effect> {
  const maybePspList: Option<ReadonlyArray<Psp>> = yield call(
    fetchPspList,
    pagoPaClient,
    paymentId
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
  if (shouldShowPspList(wallet, pspList)) {
    // multiple choices here and no favorite psp exists (or one exists
    // and it is not available for this payment)
    // show list of psps
    yield call(showPickPsp, paymentId, wallet, pspList);
  } else {
    // only 1 choice of psp, or psp already selected (in previous transaction)
    yield call(showConfirmPaymentMethod, paymentId, wallet, pspList);
  }
}

const MAX_RETRIES_POLLING = 180;
const DELAY_BETWEEN_RETRIES_MS = 1000;

// handle the "attiva" API call
async function attivaRpt(
  postAttivaRpt: TypeofApiCall<ActivatePaymentT>,
  rptId: RptId,
  paymentContextCode: CodiceContestoPagamento,
  amount: AmountInEuroCents
): Promise<Either<NodoErrors, PaymentActivationsPostResponse>> {
  const response:
    | TypeofApiResponse<ActivatePaymentT>
    | undefined = await postAttivaRpt({
    paymentActivationsPostRequest: {
      rptId: RptIdFromString.encode(rptId),
      codiceContestoPagamento: paymentContextCode,
      importoSingoloVersamento: amountToImportoWithFallback(amount)
    }
  });
  return response !== undefined && response.status === 200
    ? right(response.value) // none if everything works out fine
    : left(extractNodoError(response));
}

// handle the polling
async function fetchPaymentId(
  getPaymentIdApi: TypeofApiCall<GetActivationStatusT>,
  paymentContextCode: CodiceContestoPagamento
): Promise<Either<NodoErrors, string>> {
  // successfully request the payment activation
  // now poll until a paymentId is made available

  const response = await getPaymentIdApi({
    codiceContestoPagamento: paymentContextCode
  });
  return response !== undefined && response.status === 200
    ? right(response.value.idPagamento)
    : response !== undefined && response.status === 404
      ? left<NodoErrors, string>("MISSING_PAYMENT_ID")
      : left<NodoErrors, string>("GENERIC_ERROR");
}

/**
 * First do the "attiva" operation then,
 * if successful, poll until a paymentId
 * is available
 */
async function attivaAndGetPaymentId(
  postAttivaRpt: TypeofApiCall<ActivatePaymentT>,
  getPaymentIdApi: TypeofApiCall<GetActivationStatusT>,
  rptId: RptId,
  paymentContextCode: CodiceContestoPagamento,
  amount: AmountInEuroCents
): Promise<Either<NodoErrors, string>> {
  const attivaRptResult = await attivaRpt(
    postAttivaRpt,
    rptId,
    paymentContextCode,
    amount
  );
  if (attivaRptResult.isLeft()) {
    return left(attivaRptResult.value);
  }
  // FIXME: why we discard the response of Attiva? we should instead update
  //        the transaction info from the data contained in the response

  return await fetchPaymentId(getPaymentIdApi, paymentContextCode);
}

function* checkPayment(
  pagoPaClient: PagoPaClient,
  paymentId: string
): Iterator<Effect> {
  try {
    yield put(paymentSetLoadingState());
    const apiCheckPayment = (token: PagopaToken) =>
      pagoPaClient.checkPayment(token, paymentId);
    const response: SagaCallReturnType<typeof apiCheckPayment> = yield call(
      fetchWithTokenRefresh,
      apiCheckPayment,
      pagoPaClient
    );
    if (response === undefined || response.status !== 200) {
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
  const maybeFavoriteWallet: Option<Wallet> = yield select<GlobalState>(
    getFavoriteWallet
  );

  // redirect as needed
  if (maybeFavoriteWallet.isSome()) {
    yield call(
      showWalletOrSelectPsp,
      pagoPaClient,
      maybeFavoriteWallet.value,
      paymentId
    );
  } else {
    // no favorite wallet selected
    // show list
    yield call(pickPaymentMethodHandler, paymentId);
  }
}

function* continueWithPaymentMethodsHandler(
  action: ActionType<typeof paymentRequestContinueWithPaymentMethods>,
  pagoPaClient: PagoPaClient,
  postAttivaRpt: TypeofApiCall<ActivatePaymentT>,
  getPaymentIdApi: TypeofApiCall<GetActivationStatusT>
) {
  // do we have a payment ID already? (e.g. in case the user navigated back)
  const maybePaymentId: Option<string> = yield select<GlobalState>(
    getPaymentIdFromGlobalState
  );

  /**
   * get data required to fetch a payment id
   */

  const rptId = action.payload.rptId;
  const paymentContextCode = action.payload.codiceContestoPagamento;
  const currentAmount = action.payload.currentAmount;

  if (maybePaymentId.isSome()) {
    // if we have a previous payment ID stored in the state from a previous
    // "attiva", continue to the next step
    yield call(
      callCheckAndSelectPaymentMethod,
      pagoPaClient,
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
        yield call(callCheckAndSelectPaymentMethod, pagoPaClient, result.value);
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

function* confirmPaymentMethodHandler(
  action: ActionType<typeof paymentRequestConfirmPaymentMethod>,
  pagoPaClient: PagoPaClient
) {
  const wallet = action.payload.wallet;
  // this will either show the recap screen (if the selected
  // wallet already has a PSP), or it will show the
  // "pick psp" screen
  yield call(
    showWalletOrSelectPsp,
    pagoPaClient,
    wallet,
    action.payload.paymentId
  );
}

function* pickPaymentMethodHandler(paymentId: string) {
  // show screen with list of payment methods available
  yield put(setPaymentStateToPickPaymentMethod(paymentId));
  yield put(navigateTo(ROUTES.PAYMENT_PICK_PAYMENT_METHOD));
}

function* pickPspHandler(action: ActionType<typeof paymentRequestPickPsp>) {
  const pspList = action.payload.pspList;

  yield put(setPaymentStateToPickPsp(action.payload.wallet, pspList));
  yield put(navigateTo(ROUTES.PAYMENT_PICK_PSP));
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
      pagoPaClient.updateWalletPsp(
        pagoPaToken,
        wallet.idWallet,
        action.payload.pspId
      );
    const response: SagaCallReturnType<typeof apiUpdateWalletPsp> = yield call(
      fetchWithTokenRefresh,
      apiUpdateWalletPsp,
      pagoPaClient
    );

    if (response !== undefined && response.status === 200) {
      // request new wallets (expecting to get the
      // same ones as before, with the selected one's
      // PSP set to the new one)
      yield call(fetchWallets, pagoPaClient);
      yield put(paymentRequestConfirmPaymentMethod({ wallet, paymentId }));
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

function* pinLoginHandler(
  action: ActionType<typeof paymentRequestPinLogin>,
  storedPin: PinString
) {
  yield put(setPaymentStateToPinLogin());
  // Retrieve the configured PIN from the keychain
  yield race({
    proceed: call(loginWithPinSaga, storedPin),
    reset: call(watchPinResetSaga)
  });

  yield put(
    paymentRequestCompletion({
      wallet: action.payload.wallet,
      paymentId: action.payload.paymentId
    })
  );
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

      // use "storeNewTransaction(newTransaction) if it's okay
      // to have the payment as "pending" (this information will
      // not be shown to the user as of yet)
      yield put(selectTransactionForDetails(newTransaction));
      yield put(selectWalletForDetails(wallet.idWallet)); // for the banner
      yield put(
        // TODO: this should use StackActions.reset
        // to reset the navigation. Right now, the
        // "back" option is not allowed -- so the user cannot
        // get back to previous screens, but the navigation
        // stack should be cleaned right here
        // @https://www.pivotaltracker.com/story/show/159300579
        navigateTo(ROUTES.WALLET_TRANSACTION_DETAILS, {
          paymentCompleted: true
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
  pagoPaClient: PagoPaClient,
  storedPin: PinString
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
    pagoPaClient,
    storedPin
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
