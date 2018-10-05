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
import { apiUrlPrefix, pagoPaApiUrlPrefix } from "../config";
import I18n from "../i18n";
import ROUTES from "../navigation/routes";

import {
  paymentCompleted,
  paymentConfirmPaymentMethod,
  paymentGoBack,
  paymentInitialConfirmPaymentMethod,
  paymentInitialPickPaymentMethod,
  paymentInitialPickPsp,
  paymentManualEntry,
  paymentPickPaymentMethod,
  paymentPickPsp,
  paymentQrCode,
  paymentRequestCancel,
  paymentRequestConfirmPaymentMethod,
  paymentRequestContinueWithPaymentMethods,
  paymentRequestGoBack,
  paymentRequestManualEntry,
  paymentRequestMessage,
  paymentRequestPickPaymentMethod,
  paymentRequestPickPsp,
  paymentRequestPinLogin,
  paymentRequestQrCode,
  paymentRequestTransactionSummaryFromBanner,
  paymentRequestTransactionSummaryFromRptId,
  paymentResetLoadingState,
  paymentSetLoadingState,
  paymentTransactionSummaryFromBanner,
  paymentTransactionSummaryFromRptId,
  paymentUpdatePsp
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
import {
  sessionTokenSelector,
  walletTokenSelector
} from "../store/reducers/authentication";
import { getPagoPaToken } from "../store/reducers/wallet/pagopa";
import {
  getCurrentAmount,
  getPaymentContextCode,
  getPaymentId,
  getPspList,
  getRptId,
  getSelectedPaymentMethod,
  isGlobalStateWithPaymentId
} from "../store/reducers/wallet/payment";
import {
  getFavoriteWalletId,
  specificWalletSelector,
  walletCountSelector
} from "../store/reducers/wallet/wallets";
import {
  paymentCancel,
  paymentFailure,
  paymentPinLogin,
  paymentRequestCompletion
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
    const pagoPaToken: Option<PagopaToken> = yield select(getPagoPaToken);
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
  const currentCount: number = yield select(walletCountSelector);
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

function* paymentSagaFromQrCode(
  getVerificaRpt: TypeofApiCall<GetPaymentInfoT>,
  postAttivaRpt: TypeofApiCall<ActivatePaymentT>,
  getPaymentIdApi: TypeofApiCall<GetActivationStatusT>,
  storedPin: PinString
): Iterator<Effect> {
  yield put(paymentQrCode());
  yield put(navigateTo(ROUTES.PAYMENT_SCAN_QR_CODE)); // start by showing qr code scanner
  yield fork(
    watchPaymentSaga,
    getVerificaRpt,
    postAttivaRpt,
    getPaymentIdApi,
    storedPin
  );
}

/**
 * This saga is forked at the beginning of a payment flow
 */
function* watchPaymentSaga(
  getVerificaRpt: TypeofApiCall<GetPaymentInfoT>,
  postAttivaRpt: TypeofApiCall<ActivatePaymentT>,
  getPaymentIdApi: TypeofApiCall<GetActivationStatusT>,
  storedPin: PinString
): Iterator<Effect> {
  while (true) {
    const action:
      | ActionType<typeof paymentRequestQrCode>
      | ActionType<typeof paymentRequestManualEntry>
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
      | ActionType<typeof paymentCompleted>
      | ActionType<typeof paymentRequestPinLogin> = yield take([
      getType(paymentRequestQrCode),
      getType(paymentRequestManualEntry),
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
      getType(paymentCompleted)
    ]);

    if (isActionOf(paymentCompleted, action)) {
      // On payment completed, stop listening for actions
      break;
    }

    const maybeWalletToken: Option<string> = yield select(walletTokenSelector);
    if (maybeWalletToken.isSome()) {
      const pagoPaClient = PagoPaClient(
        pagoPaApiUrlPrefix,
        maybeWalletToken.value
      );

      switch (action.type) {
        case getType(paymentRequestManualEntry): {
          yield fork(enterDataManuallyHandler, action, pagoPaClient);
          break;
        }
        case getType(paymentRequestTransactionSummaryFromRptId):
        case getType(paymentRequestTransactionSummaryFromBanner): {
          yield fork(
            showTransactionSummaryHandler,
            action,
            pagoPaClient,
            getVerificaRpt
          );
          break;
        }
        case getType(paymentRequestContinueWithPaymentMethods): {
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
          yield fork(pickPaymentMethodHandler);
          break;
        }
        case getType(paymentRequestConfirmPaymentMethod): {
          yield fork(confirmPaymentMethodHandler, action, pagoPaClient);
          break;
        }
        case getType(paymentRequestPickPsp): {
          yield fork(pickPspHandler, action, pagoPaClient);
          break;
        }
        case getType(paymentUpdatePsp): {
          yield fork(updatePspHandler, action, pagoPaClient);
          break;
        }
        case getType(paymentRequestCompletion): {
          yield fork(completionHandler, pagoPaClient);
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
          yield fork(pinLoginHandler, storedPin);
          break;
        }
      }
    }
  }
}

function* cancelPaymentHandler(_: ActionType<typeof paymentRequestCancel>) {
  yield put(paymentCancel()); // empty the stack
  yield put(navigateTo(ROUTES.WALLET_HOME));
}

function* goBackHandler(_: ActionType<typeof paymentRequestGoBack>) {
  yield put(paymentGoBack()); // return to previous state
  yield put(NavigationActions.back());
}

function* enterDataManuallyHandler(
  _: ActionType<typeof paymentRequestManualEntry>,
  __: PagoPaClient
): Iterator<Effect> {
  // from the QR code screen the user selected
  // the option for entering the data manually
  // -> navigate to manual data insertion screen
  yield put(paymentManualEntry());
  yield put(navigateTo(ROUTES.PAYMENT_MANUAL_DATA_INSERTION));
}

function* showTransactionSummaryHandler(
  action:
    | ActionType<typeof paymentRequestTransactionSummaryFromBanner>
    | ActionType<typeof paymentRequestTransactionSummaryFromRptId>,
  _: PagoPaClient,
  getVerificaRpt: TypeofApiCall<GetPaymentInfoT>
) {
  // the user may have gotten here from the QR code,
  // the manual data entry, from a message OR by
  // tapping on the payment banner further in the process.
  // in all cases but the last one, a payload will be
  // provided, and it will contain the RptId information
  if (isActionOf(paymentRequestTransactionSummaryFromRptId, action)) {
    // either the QR code has been read, or the
    // data has been entered manually. Store the
    // payload and proceed with showing the
    // transaction information fetched from the
    // pagoPA proxy

    // First, navigate to the summary screen
    yield put(navigateTo(ROUTES.PAYMENT_TRANSACTION_SUMMARY));

    const {
      rptId,
      initialAmount
    }: { rptId: RptId; initialAmount: AmountInEuroCents } = action.payload;

    try {
      yield put(paymentSetLoadingState());
      const response: SagaCallReturnType<typeof getVerificaRpt> = yield call(
        getVerificaRpt,
        {
          rptId: RptIdFromString.encode(rptId)
        }
      );
      if (response !== undefined && response.status === 200) {
        // response fetched successfully -- store it
        // and proceed
        yield put(
          paymentTransactionSummaryFromRptId(
            rptId,
            initialAmount,
            response.value
          )
        );
      } else {
        yield put(paymentFailure(extractNodoError(response)));
      }
    } catch {
      yield put(paymentFailure("GENERIC_ERROR"));
    } finally {
      yield put(paymentResetLoadingState());
    }
  } else {
    // also, show summary screen
    yield put(paymentTransactionSummaryFromBanner());
    yield put(navigateTo(ROUTES.PAYMENT_TRANSACTION_SUMMARY));
  }
}

function* showConfirmPaymentMethod(
  paymentIdOrUndefined: string | undefined,
  wallet: Wallet,
  pspList: ReadonlyArray<Psp>
) {
  yield put(
    paymentIdOrUndefined === undefined
      ? paymentConfirmPaymentMethod(wallet.idWallet, pspList)
      : paymentInitialConfirmPaymentMethod(
          wallet.idWallet,
          pspList,
          paymentIdOrUndefined
        )
  );
  yield put(navigateTo(ROUTES.PAYMENT_CONFIRM_PAYMENT_METHOD));
}

function* showPickPsp(
  paymentIdOrUndefined: string | undefined,
  wallet: Wallet,
  pspList: ReadonlyArray<Psp>
) {
  yield put(
    paymentIdOrUndefined === undefined
      ? paymentPickPsp(wallet.idWallet, pspList)
      : paymentInitialPickPsp(wallet.idWallet, pspList, paymentIdOrUndefined)
  );
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
  paymentIdOrUndefined: string | undefined
) {
  // WIP: this could be done via the ternary operator, but lint raises some
  // error about ignoring the return value of a call()
  let paymentId: string; // tslint:disable-line: no-let
  if (paymentIdOrUndefined === undefined) {
    const tmp: string = yield select(getPaymentId);
    paymentId = tmp;
  } else {
    paymentId = paymentIdOrUndefined;
  }

  let pspList: ReadonlyArray<Psp> = []; // tslint:disable-line: no-let

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
      pspList = response.value.data;
    }
  } catch {
    /**
     * TODO handle error
     */
  } finally {
    yield put(paymentResetLoadingState());
  }

  return pspList;
}

function* showWalletOrSelectPsp(
  pagoPaClient: PagoPaClient,
  idWallet: number,
  paymentIdOrUndefined?: string
): Iterator<Effect> {
  const wallet: Option<Wallet> = yield select(specificWalletSelector(idWallet));
  if (wallet.isSome()) {
    const pspList: ReadonlyArray<Psp> = yield call(
      fetchPspList,
      pagoPaClient,
      paymentIdOrUndefined
    );
    // show card
    // if multiple psps are available and one
    // has not yet been selected, show psp list
    if (shouldShowPspList(wallet.value, pspList)) {
      // multiple choices here and no favorite psp exists (or one exists
      // and it is not available for this payment)
      // show list of psps
      yield call(showPickPsp, paymentIdOrUndefined, wallet.value, pspList);
    } else {
      // only 1 choice of psp, or psp already selected (in previous transaction)
      yield call(
        showConfirmPaymentMethod,
        paymentIdOrUndefined,
        wallet.value,
        pspList
      );
    }
  }
}

const MAX_RETRIES_POLLING = 180;
const DELAY_BETWEEN_RETRIES_MS = 1000;

// handle the "attiva" API call
const attivaRpt = async (
  postAttivaRpt: TypeofApiCall<ActivatePaymentT>,
  rptId: RptId,
  paymentContextCode: CodiceContestoPagamento,
  amount: AmountInEuroCents
): Promise<Option<NodoErrors>> => {
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
    ? none // none if everything works out fine
    : some(extractNodoError(response));
};

// handle the polling
const fetchPaymentId = async (
  getPaymentIdApi: TypeofApiCall<GetActivationStatusT>,
  paymentContextCode: CodiceContestoPagamento
): Promise<Either<NodoErrors, string>> => {
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
};

/**
 * First do the "attiva" operation then,
 * if successful, poll until a paymentId
 * is available
 */
const attivaAndGetPaymentId = async (
  postAttivaRpt: TypeofApiCall<ActivatePaymentT>,
  getPaymentIdApi: TypeofApiCall<GetActivationStatusT>,
  rptId: RptId,
  paymentContextCode: CodiceContestoPagamento,
  amount: AmountInEuroCents
): Promise<Either<NodoErrors, string>> => {
  const attivaRptResult = await attivaRpt(
    postAttivaRpt,
    rptId,
    paymentContextCode,
    amount
  );
  if (attivaRptResult.isSome()) {
    return left(attivaRptResult.value);
  }
  return await fetchPaymentId(getPaymentIdApi, paymentContextCode);
};

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
    }
    // else show an error modal @https://www.pivotaltracker.com/story/show/159400682
  } catch {
    yield put(paymentFailure("GENERIC_ERROR"));
  } finally {
    yield put(paymentResetLoadingState());
  }
}

function* continueWithPaymentMethodsHandler(
  _: ActionType<typeof paymentRequestContinueWithPaymentMethods>,
  pagoPaClient: PagoPaClient,
  postAttivaRpt: TypeofApiCall<ActivatePaymentT>,
  getPaymentIdApi: TypeofApiCall<GetActivationStatusT>
) {
  // find out whether a payment method has already
  // been defined as favorite. If so, use it and
  // ask the user to confirm it
  // Otherwise, show a list of payment methods available
  // TODO: if no payment method is available (or if the
  // user chooses to do so), allow adding a new one.
  const favoriteWallet: Option<number> = yield select(getFavoriteWalletId);
  const hasPaymentId: boolean = yield select(isGlobalStateWithPaymentId);

  /**
   * get data required to fetch a payment id
   */
  const sessionToken: SessionToken | undefined = yield select(
    sessionTokenSelector
  );
  const rptId: RptId = yield select(getRptId);
  const paymentContextCode: CodiceContestoPagamento = yield select(
    getPaymentContextCode
  );
  const amount: AmountInEuroCents = yield select(getCurrentAmount);

  // if the payment Id not available yet,
  // do the "attiva" and then poll until
  // a payment Id shows up
  let paymentId: string | undefined; // tslint:disable-line no-let
  if (!hasPaymentId && sessionToken !== undefined) {
    try {
      yield put(paymentSetLoadingState());
      const result: Either<NodoErrors, string> = yield call(
        attivaAndGetPaymentId,
        postAttivaRpt,
        getPaymentIdApi,
        rptId,
        paymentContextCode,
        amount
      );
      if (result.isRight()) {
        paymentId = result.value;
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
  if (paymentId !== undefined) {
    yield call(checkPayment, pagoPaClient, paymentId);
  }

  // redirect as needed
  if (favoriteWallet.isSome()) {
    yield call(
      showWalletOrSelectPsp,
      pagoPaClient,
      favoriteWallet.value,
      hasPaymentId && paymentId !== undefined ? undefined : paymentId
    );
  } else {
    // no favorite wallet selected
    // show list
    yield call(pickPaymentMethodHandler, paymentId);
  }
}

function* confirmPaymentMethodHandler(
  action: ActionType<typeof paymentRequestConfirmPaymentMethod>,
  pagoPaClient: PagoPaClient
) {
  const walletId = action.payload;
  // this will either show the recap screen (if the selected
  // wallet already has a PSP), or it will show the
  // "pick psp" screen
  yield call(showWalletOrSelectPsp, pagoPaClient, walletId, undefined);
}

function* pickPaymentMethodHandler(paymentId?: string) {
  // show screen with list of payment methods available
  yield put(
    paymentId
      ? paymentInitialPickPaymentMethod(paymentId)
      : paymentPickPaymentMethod()
  );
  yield put(navigateTo(ROUTES.PAYMENT_PICK_PAYMENT_METHOD));
}

function* pickPspHandler() {
  const walletId: number = yield select(getSelectedPaymentMethod);
  const pspList: ReadonlyArray<Psp> = yield select(getPspList);

  yield put(paymentPickPsp(walletId, pspList));
  yield put(navigateTo(ROUTES.PAYMENT_PICK_PSP));
}

function* updatePspHandler(
  action: ActionType<typeof paymentUpdatePsp>,
  pagoPaClient: PagoPaClient
) {
  // First update the selected wallet (walletId) with the
  // new PSP (action.payload); then request a new list
  // of wallets (which will contain the updated PSP)
  const walletId: number = yield select(getSelectedPaymentMethod);

  try {
    yield put(paymentSetLoadingState());
    const apiUpdateWalletPsp = (pagoPaToken: PagopaToken) =>
      pagoPaClient.updateWalletPsp(pagoPaToken, walletId, action.payload);
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
      yield put(paymentRequestConfirmPaymentMethod(walletId));
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

function* pinLoginHandler(storedPin: PinString) {
  yield put(paymentPinLogin());
  // Retrieve the configured PIN from the keychain
  yield race({
    proceed: call(loginWithPinSaga, storedPin),
    reset: call(watchPinResetSaga)
  });

  yield put(paymentRequestCompletion());
}

function* completionHandler(pagoPaClient: PagoPaClient) {
  // -> it should proceed with the required operations
  // and terminate with the "new payment" screen

  const idWallet: number = yield select(getSelectedPaymentMethod);
  const paymentId: string = yield select(getPaymentId);

  try {
    yield put(paymentSetLoadingState());
    const apiPostPayment = (pagoPaToken: PagopaToken) =>
      pagoPaClient.postPayment(pagoPaToken, paymentId, {
        data: { tipo: "web", idWallet }
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
      // use "storeNewTransaction(newTransaction) if it's okay
      // to have the payment as "pending" (this information will
      // not be shown to the user as of yet)
      yield put(selectTransactionForDetails(newTransaction));
      yield put(selectWalletForDetails(idWallet)); // for the banner
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
      yield put(paymentCompleted());
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

  // Start listening for actions that start the payment flow from a QR code.
  yield takeLatest(
    getType(paymentRequestQrCode),
    paymentSagaFromQrCode,
    backendClient.getVerificaRpt,
    backendClient.postAttivaRpt,
    pollingBackendClient.getPaymentId,
    storedPin
  );
  // Start listening for actions that start the payment flow from a message.
  yield takeLatest(
    getType(paymentRequestMessage),
    watchPaymentSaga,
    backendClient.getVerificaRpt,
    backendClient.postAttivaRpt,
    pollingBackendClient.getPaymentId,
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
