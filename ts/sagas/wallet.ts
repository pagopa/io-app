// tslint:disable:max-union-size

import { RptIdFromString } from "italia-ts-commons/lib/pagopa";
import {
  paymentCancel,
  PaymentRequestMessage
} from "./../store/actions/wallet/payment";

/**
 * A saga that manages the Wallet.
 */

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

import { Option, some } from "fp-ts/lib/Option";
import { AmountInEuroCents, RptId } from "italia-ts-commons/lib/pagopa";
import { TypeofApiCall } from "italia-ts-commons/lib/requests";
import { NavigationActions } from "react-navigation";
import { CodiceContestoPagamento } from "../../definitions/backend/CodiceContestoPagamento";
import { PaymentActivationsPostResponse } from "../../definitions/backend/PaymentActivationsPostResponse";
import { PaymentRequestsGetResponse } from "../../definitions/backend/PaymentRequestsGetResponse";
import { PaymentResponse } from "../../definitions/pagopa/PaymentResponse";
import {
  AttivaRptT,
  BackendClient,
  BasicResponseTypeWith401,
  GetPaymentIdT,
  VerificaRptT
} from "../api/backend";
import { PagoPaClient } from "../api/pagopa";
import { apiUrlPrefix, pagoPaApiUrlPrefix } from "../config";
import ROUTES from "../navigation/routes";
import { LogoutSuccess } from "../store/actions/authentication";
import {
  ADD_CREDIT_CARD_COMPLETED,
  ADD_CREDIT_CARD_REQUEST,
  FETCH_TRANSACTIONS_REQUEST,
  FETCH_WALLETS_REQUEST,
  LOGOUT_SUCCESS,
  PAYMENT_COMPLETED,
  PAYMENT_REQUEST_CANCEL,
  PAYMENT_REQUEST_COMPLETION,
  PAYMENT_REQUEST_CONFIRM_PAYMENT_METHOD,
  PAYMENT_REQUEST_CONTINUE_WITH_PAYMENT_METHODS,
  PAYMENT_REQUEST_GO_BACK,
  PAYMENT_REQUEST_MANUAL_ENTRY,
  PAYMENT_REQUEST_MESSAGE,
  PAYMENT_REQUEST_PICK_PAYMENT_METHOD,
  PAYMENT_REQUEST_PICK_PSP,
  PAYMENT_REQUEST_QR_CODE,
  PAYMENT_REQUEST_TRANSACTION_SUMMARY,
  PAYMENT_UPDATE_PSP
} from "../store/actions/constants";
import { storePagoPaToken } from "../store/actions/wallet/pagopa";
import {
  PaymentCompleted,
  paymentConfirmPaymentMethod,
  paymentGoBack,
  paymentInitialConfirmPaymentMethod,
  paymentInitialPickPaymentMethod,
  paymentInitialPickPsp,
  paymentManualEntry,
  paymentPickPaymentMethod,
  paymentPickPsp,
  paymentQrCode,
  PaymentRequestCancel,
  PaymentRequestCompletion,
  PaymentRequestConfirmPaymentMethod,
  paymentRequestConfirmPaymentMethod,
  PaymentRequestContinueWithPaymentMethods,
  PaymentRequestGoBack,
  PaymentRequestManualEntry,
  PaymentRequestPickPaymentMethod,
  PaymentRequestPickPsp,
  PaymentRequestQrCode,
  PaymentRequestTransactionSummaryActions,
  PaymentRequestTransactionSummaryFromBanner,
  paymentResetLoadingState,
  paymentSetLoadingState,
  paymentTransactionSummaryFromBanner,
  paymentTransactionSummaryFromRptId,
  PaymentUpdatePsp
} from "../store/actions/wallet/payment";
import {
  FetchTransactionsRequest,
  selectTransactionForDetails,
  transactionsFetched
} from "../store/actions/wallet/transactions";
import {
  AddCreditCardRequest,
  creditCardDataCleanup,
  FetchWalletsRequest,
  selectWalletForDetails,
  walletManagementResetLoadingState,
  walletManagementSetLoadingState,
  walletsFetched
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
  CreditCard,
  NullableWallet,
  PayRequest,
  Psp,
  PspListResponse,
  SessionResponse,
  Transaction,
  TransactionListResponse,
  TransactionResponse,
  Wallet,
  WalletListResponse,
  WalletResponse
} from "../types/pagopa";
import { PinString } from "../types/PinString";
import { SessionToken } from "../types/SessionToken";
import { amountToImportoWithFallback } from "../utils/amounts";
import { constantPollingFetch, pagopaFetch } from "../utils/fetch";
import { loginWithPinSaga } from "./startup/pinLoginSaga";
import { watchPinResetSaga } from "./startup/watchPinResetSaga";

// allow refreshing token this number of times
const MAX_TOKEN_REFRESHES = 2;

const navigateTo = (routeName: string, params?: object) => {
  return NavigationActions.navigate({ routeName, params });
};

// this function tries to carry out the provided
// request, and refreshes the pagoPA token if a 401
// is returned. Upon refreshing, it tries to
// re-fetch the contents again for a maximum of
// MAX_TOKEN_REFRESHES times.
// If the request is successful (i.e. it does not
// return a 401), the successful token is returned
// along with the response (the caller will then
// decide what to do with it)
function* fetchWithTokenRefresh<T>(
  request: (
    pagoPaToken: string
  ) => Promise<BasicResponseTypeWith401<T> | undefined>,
  pagoPaClient: PagoPaClient,
  retries: number = MAX_TOKEN_REFRESHES
): Iterator<BasicResponseTypeWith401<T> | undefined | Effect> {
  if (retries === 0) {
    return undefined;
  }
  const pagoPaToken: Option<string> = yield select(getPagoPaToken);
  const response: BasicResponseTypeWith401<T> | undefined = yield call(
    request,
    pagoPaToken.getOrElse("") // empty token -> pagoPA returns a 401 and the app fetches a new one
  );
  if (response !== undefined) {
    if (response.status !== 401) {
      // return code is not 401, the token
      // has been "accepted" (the caller will
      // then handle other error codes)
      return response;
    } else {
      yield call(fetchAndStorePagoPaToken, pagoPaClient);

      // and retry fetching the result
      return yield call(
        fetchWithTokenRefresh,
        request,
        pagoPaClient,
        retries - 1
      );
    }
  }
  return undefined;
}

function* fetchAndStorePagoPaToken(pagoPaClient: PagoPaClient) {
  const refreshTokenResponse:
    | BasicResponseTypeWith401<SessionResponse>
    | undefined = yield call(pagoPaClient.getSession, pagoPaClient.walletToken);
  if (
    refreshTokenResponse !== undefined &&
    refreshTokenResponse.status === 200
  ) {
    // token fetched successfully, store it
    yield put(
      storePagoPaToken(some(refreshTokenResponse.value.data.sessionToken))
    );
  }
}

function* fetchTransactions(pagoPaClient: PagoPaClient): Iterator<Effect> {
  const response:
    | BasicResponseTypeWith401<TransactionListResponse>
    | undefined = yield call(
    fetchWithTokenRefresh,
    pagoPaClient.getTransactions,
    pagoPaClient
  );
  if (response !== undefined && response.status === 200) {
    yield put(transactionsFetched(response.value.data));
  }
  // else show an error modal @https://www.pivotaltracker.com/story/show/159400682
}

function* fetchWallets(pagoPaClient: PagoPaClient): Iterator<Effect> {
  const response:
    | BasicResponseTypeWith401<WalletListResponse>
    | undefined = yield call(
    fetchWithTokenRefresh,
    pagoPaClient.getWallets,
    pagoPaClient
  );
  if (response !== undefined && response.status === 200) {
    yield put(walletsFetched(response.value.data));
  }
  // else show an error modal @https://www.pivotaltracker.com/story/show/159400682
}

function* addCreditCard(
  creditCard: CreditCard,
  _: boolean, // should the card be set as favorite?
  pagoPaClient: PagoPaClient
): Iterator<Effect> {
  try {
    yield put(walletManagementSetLoadingState());
    const wallet: NullableWallet = {
      idWallet: null,
      type: "CREDIT_CARD",
      favourite: null,
      creditCard
    };
    // 1st call: boarding credit card
    const responseBoardCC:
      | BasicResponseTypeWith401<WalletResponse>
      | undefined = yield call(
      fetchWithTokenRefresh,
      (token: string) => pagoPaClient.boardCreditCard(token, wallet),
      pagoPaClient
    );

    /**
     * Failed request. show an error (TODO) and return
     */
    if (responseBoardCC === undefined || responseBoardCC.status !== 200) {
      console.warn(responseBoardCC);
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
    const responseBoardPay:
      | BasicResponseTypeWith401<TransactionResponse>
      | undefined = yield call(
      fetchWithTokenRefresh,
      (token: string) => pagoPaClient.boardPay(token, payRequest),
      pagoPaClient
    );
    /**
     * Failed request. show an error (TODO) and return
     */
    if (responseBoardPay === undefined || responseBoardPay.status !== 200) {
      return;
    }
    const url = responseBoardPay.value.data.urlCheckout3ds;
    const pagoPaToken: Option<string> = yield select(getPagoPaToken);
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
  yield take(ADD_CREDIT_CARD_COMPLETED);

  // There currently is no way of determining
  // whether the card has been added successfully from
  // the URL returned in the webview, so the approach here
  // is: count current number of cards, refresh cards,
  // check if new number of cards is previous number + 1.
  // If so, the card has been added.
  // TODO: find a way of finding out the result of the
  // request from the URL
  const currentCount: number = yield select(walletCountSelector);
  yield call(fetchWallets, pagoPaClient);
  const updatedCount: number = yield select(walletCountSelector);
  /**
   * TODO: introduce a better way of displaying
   * info messages (e.g. red/green banner at the
   * top of the screen)
   */
  if (updatedCount === currentCount + 1) {
    console.warn("Card added successfully!"); // tslint:disable-line no-console
  } else {
    console.warn("The card could not be added :("); // tslint:disable-line no-console
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

function* paymentSagaFromQrCode(
  getVerificaRpt: TypeofApiCall<VerificaRptT>,
  postAttivaRpt: TypeofApiCall<AttivaRptT>,
  getPaymentIdApi: TypeofApiCall<GetPaymentIdT>,
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

function* paymentSagaFromMessage(
  getVerificaRpt: TypeofApiCall<VerificaRptT>,
  postAttivaRpt: TypeofApiCall<AttivaRptT>,
  getPaymentIdApi: TypeofApiCall<GetPaymentIdT>,
  storedPin: PinString
): Iterator<Effect> {
  yield fork(
    watchPaymentSaga,
    getVerificaRpt,
    postAttivaRpt,
    getPaymentIdApi,
    storedPin
  );
}

function* watchPaymentSaga(
  getVerificaRpt: TypeofApiCall<VerificaRptT>,
  postAttivaRpt: TypeofApiCall<AttivaRptT>,
  getPaymentIdApi: TypeofApiCall<GetPaymentIdT>,
  storedPin: PinString
): Iterator<Effect> {
  while (true) {
    const action:
      | PaymentRequestQrCode
      | PaymentRequestManualEntry
      | PaymentRequestTransactionSummaryFromBanner
      | PaymentRequestContinueWithPaymentMethods
      | PaymentRequestPickPaymentMethod
      | PaymentRequestConfirmPaymentMethod
      | PaymentRequestPickPsp
      | PaymentUpdatePsp
      | PaymentRequestCompletion
      | PaymentRequestGoBack
      | PaymentRequestCancel
      | PaymentCompleted = yield take([
      PAYMENT_REQUEST_QR_CODE,
      PAYMENT_REQUEST_MANUAL_ENTRY,
      PAYMENT_REQUEST_TRANSACTION_SUMMARY,
      PAYMENT_REQUEST_CONTINUE_WITH_PAYMENT_METHODS,
      PAYMENT_REQUEST_PICK_PAYMENT_METHOD,
      PAYMENT_REQUEST_CONFIRM_PAYMENT_METHOD,
      PAYMENT_REQUEST_PICK_PSP,
      PAYMENT_UPDATE_PSP,
      PAYMENT_REQUEST_COMPLETION,
      PAYMENT_REQUEST_GO_BACK,
      PAYMENT_REQUEST_CANCEL,
      PAYMENT_COMPLETED
    ]);
    if (action.type === PAYMENT_COMPLETED) {
      break;
    }

    const maybeWalletToken: Option<string> = yield select(walletTokenSelector);
    if (maybeWalletToken.isSome()) {
      const pagoPaClient = PagoPaClient(
        pagoPaApiUrlPrefix,
        maybeWalletToken.value
      );

      switch (action.type) {
        case PAYMENT_REQUEST_MANUAL_ENTRY: {
          yield fork(enterDataManuallyHandler, action, pagoPaClient);
          break;
        }
        case PAYMENT_REQUEST_TRANSACTION_SUMMARY: {
          yield fork(
            showTransactionSummaryHandler,
            action,
            pagoPaClient,
            getVerificaRpt
          );
          break;
        }
        case PAYMENT_REQUEST_CONTINUE_WITH_PAYMENT_METHODS: {
          yield fork(
            continueWithPaymentMethodsHandler,
            action,
            pagoPaClient,
            postAttivaRpt,
            getPaymentIdApi
          );
          break;
        }
        case PAYMENT_REQUEST_PICK_PAYMENT_METHOD: {
          yield fork(pickPaymentMethodHandler, action, pagoPaClient);
          break;
        }
        case PAYMENT_REQUEST_CONFIRM_PAYMENT_METHOD: {
          yield fork(confirmPaymentMethodHandler, action, pagoPaClient);
          break;
        }
        case PAYMENT_REQUEST_PICK_PSP: {
          yield fork(pickPspHandler, action, pagoPaClient);
          break;
        }
        case PAYMENT_UPDATE_PSP: {
          yield fork(updatePspHandler, action, pagoPaClient);
          break;
        }
        case PAYMENT_REQUEST_COMPLETION: {
          yield fork(completionHandler, action, pagoPaClient, storedPin);
          break;
        }
        case PAYMENT_REQUEST_GO_BACK: {
          yield fork(goBackHandler, action, pagoPaClient);
          break;
        }
        case PAYMENT_REQUEST_CANCEL: {
          yield fork(cancelPaymentHandler, action);
          break;
        }
      }
    }
  }
}

function* cancelPaymentHandler(_: PaymentRequestCancel) {
  yield put(paymentCancel()); // empty the stack
  yield put(navigateTo(ROUTES.WALLET_HOME));
}

function* goBackHandler(_: PaymentRequestGoBack) {
  yield put(paymentGoBack()); // return to previous state
  yield put(NavigationActions.back());
}

function* enterDataManuallyHandler(
  _: PaymentRequestManualEntry,
  __: PagoPaClient
): Iterator<Effect> {
  // from the QR code screen the user selected
  // the option for entering the data manually
  // -> navigate to manual data insertion screen
  yield put(paymentManualEntry());
  yield put(navigateTo(ROUTES.PAYMENT_MANUAL_DATA_INSERTION));
}

function* showTransactionSummaryHandler(
  action: PaymentRequestTransactionSummaryActions,
  _: PagoPaClient,
  getVerificaRpt: TypeofApiCall<VerificaRptT>
) {
  // the user may have gotten here from the QR code,
  // the manual data entry, from a message OR by
  // tapping on the payment banner further in the process.
  // in all cases but the last one, a payload will be
  // provided, and it will contain the RptId information
  if (action.kind === "fromRptId") {
    // either the QR code has been read, or the
    // data has been entered manually. Store the
    // payload and proceed with showing the
    // transaction information fetched from the
    // pagoPA proxy
    const {
      rptId,
      initialAmount
    }: { rptId: RptId; initialAmount: AmountInEuroCents } = action.payload;

    try {
      yield put(paymentSetLoadingState());
      const response:
        | BasicResponseTypeWith401<PaymentRequestsGetResponse>
        | undefined = yield call(getVerificaRpt, { rptId });
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
      } // TODO else manage errors @https://www.pivotaltracker.com/story/show/159400682
    } catch {
      /**
       * TODO handle error
       */
    } finally {
      yield put(paymentResetLoadingState());
    }
  } else {
    yield put(paymentTransactionSummaryFromBanner());
  }
  // also, show summary screen
  yield put(navigateTo(ROUTES.PAYMENT_TRANSACTION_SUMMARY));
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
    const response:
      | BasicResponseTypeWith401<PspListResponse>
      | undefined = yield call(
      fetchWithTokenRefresh,
      (pagoPaToken: string) => pagoPaClient.getPspList(pagoPaToken, paymentId),
      pagoPaClient
    );
    if (response !== undefined) {
      if (response.status === 200) {
        pspList = response.value.data;
      }
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
  postAttivaRpt: TypeofApiCall<AttivaRptT>,
  rptId: RptId,
  paymentContextCode: CodiceContestoPagamento,
  amount: AmountInEuroCents
): Promise<boolean> => {
  const response:
    | BasicResponseTypeWith401<PaymentActivationsPostResponse>
    | undefined = await postAttivaRpt({
    rptId: RptIdFromString.encode(rptId),
    paymentContextCode,
    amount: amountToImportoWithFallback(amount)
  });
  return response !== undefined && response.status === 200;
};

// handle the polling
const fetchPaymentId = async (
  getPaymentIdApi: TypeofApiCall<GetPaymentIdT>,
  paymentContextCode: CodiceContestoPagamento
): Promise<string | undefined> => {
  // successfully request the payment activation
  // now poll until a paymentId is made available

  const response = await getPaymentIdApi({ paymentContextCode });
  return response !== undefined && response.status === 200
    ? response.value.idPagamento
    : undefined;
};

/**
 * First do the "attiva" operation then,
 * if successful, poll until a paymentId
 * is available
 */
const attivaAndGetPaymentId = async (
  postAttivaRpt: TypeofApiCall<AttivaRptT>,
  getPaymentIdApi: TypeofApiCall<GetPaymentIdT>,
  rptId: RptId,
  paymentContextCode: CodiceContestoPagamento,
  amount: AmountInEuroCents
): Promise<string | undefined> => {
  const attivaRptResult = await attivaRpt(
    postAttivaRpt,
    rptId,
    paymentContextCode,
    amount
  );
  if (!attivaRptResult) {
    return undefined;
  }
  return await fetchPaymentId(getPaymentIdApi, paymentContextCode);
};

function* checkPayment(
  pagoPaClient: PagoPaClient,
  paymentId: string
): Iterator<Effect> {
  try {
    yield put(paymentSetLoadingState());
    const response:
      | BasicResponseTypeWith401<PaymentResponse>
      | undefined = yield call(
      fetchWithTokenRefresh,
      (t: string) => pagoPaClient.checkPayment(t, paymentId),
      pagoPaClient
    );
    if (response !== undefined) {
      if (response.status === 200) {
        // all is well
        // this does not provide any useful information and
        // it is only required by pagoPA b/c of their internal logics
      }
    }
    // else show an error modal @https://www.pivotaltracker.com/story/show/159400682
  } catch {
    /**
     * TODO handle error
     */
  } finally {
    yield put(paymentResetLoadingState());
  }
}

function* continueWithPaymentMethodsHandler(
  _: PaymentRequestContinueWithPaymentMethods,
  pagoPaClient: PagoPaClient,
  postAttivaRpt: TypeofApiCall<AttivaRptT>,
  getPaymentIdApi: TypeofApiCall<GetPaymentIdT>
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
      const tmp: string | undefined = yield call(
        attivaAndGetPaymentId,
        postAttivaRpt,
        getPaymentIdApi,
        rptId,
        paymentContextCode,
        amount
      );
      paymentId = tmp;
    } catch {
      /**
       * TODO handle error
       */
    } finally {
      yield put(paymentResetLoadingState());
    }
  }
  if (paymentId !== undefined) {
    yield call(checkPayment, pagoPaClient, paymentId);
  }

  // in case  (paymentId === undefined && !hasPaymentId),
  // the payment id could not be fetched successfully. Handle
  // the error here @https://www.pivotaltracker.com/story/show/159400682

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
    yield put(
      hasPaymentId || paymentId === undefined
        ? paymentPickPaymentMethod()
        : paymentInitialPickPaymentMethod(paymentId)
    );
    yield put(navigateTo(ROUTES.PAYMENT_PICK_PAYMENT_METHOD));
  }
}

function* confirmPaymentMethodHandler(
  action: PaymentRequestConfirmPaymentMethod,
  pagoPaClient: PagoPaClient
) {
  const walletId = action.payload;
  // this will either show the recap screen (if the selected
  // wallet already has a PSP), or it will show the
  // "pick psp" screen
  yield call(showWalletOrSelectPsp, pagoPaClient, walletId, undefined);
}

function* pickPaymentMethodHandler(_: PaymentRequestPickPaymentMethod) {
  // show screen with list of payment methods available
  yield put(paymentPickPaymentMethod());
  yield put(navigateTo(ROUTES.PAYMENT_PICK_PAYMENT_METHOD));
}

function* pickPspHandler(_: PaymentRequestPickPsp, __: PagoPaClient) {
  const walletId: number = yield select(getSelectedPaymentMethod);
  const pspList: ReadonlyArray<Psp> = yield select(getPspList);

  yield put(paymentPickPsp(walletId, pspList));
  yield put(navigateTo(ROUTES.PAYMENT_PICK_PSP));
}

function* updatePspHandler(
  action: PaymentUpdatePsp,
  pagoPaClient: PagoPaClient
) {
  // First update the selected wallet (walletId) with the
  // new PSP (action.payload); then request a new list
  // of wallets (which will contain the updated PSP)
  const walletId: number = yield select(getSelectedPaymentMethod);

  try {
    yield put(paymentSetLoadingState());
    const response:
      | BasicResponseTypeWith401<WalletResponse>
      | undefined = yield call(
      fetchWithTokenRefresh,
      (pagoPaToken: string) =>
        pagoPaClient.updateWalletPsp(pagoPaToken, walletId, action.payload),
      pagoPaClient
    );

    if (response !== undefined) {
      if (response.status === 200) {
        // request new wallets (expecting to get the
        // same ones as before, with the selected one's
        // PSP set to the new one)
        yield call(fetchWallets, pagoPaClient);
        yield put(paymentRequestConfirmPaymentMethod(walletId));
      }
    }
  } catch {
    /**
     * TODO handle error
     */
  } finally {
    yield put(paymentResetLoadingState());
  }
}

function* completionHandler(
  _: PaymentRequestCompletion,
  pagoPaClient: PagoPaClient,
  storedPin: PinString
) {
  // -> it should proceed with the required operations
  // and terminate with the "new payment" screen

  // Retrieve the configured PIN from the keychain
  yield race({
    proceed: call(loginWithPinSaga, storedPin),
    reset: call(watchPinResetSaga)
  });

  const walletId: number = yield select(getSelectedPaymentMethod);
  const paymentId: string = yield select(getPaymentId);

  try {
    yield put(paymentSetLoadingState());
    const response:
      | BasicResponseTypeWith401<TransactionResponse>
      | undefined = yield call(
      fetchWithTokenRefresh,
      (pagoPaToken: string) =>
        pagoPaClient.postPayment(pagoPaToken, paymentId, walletId),
      pagoPaClient
    );

    if (response !== undefined) {
      if (response.status === 200) {
        // request all transactions (expecting to get the
        // same ones as before, plus the newly created one
        // (the reason for this is because newTransaction contains
        // a payment with status "processing", while the
        // value returned here contains the "completed" status
        // upon successful payment
        const newTransaction: Transaction = response.value.data;
        yield call(fetchTransactions, pagoPaClient);
        // use "storeNewTransaction(newTransaction) if it's okay
        // to have the payment as "pending" (this information will
        // not be shown to the user as of yet)
        yield put(selectTransactionForDetails(newTransaction));
        yield put(selectWalletForDetails(walletId)); // for the banner
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
        yield put({ type: PAYMENT_COMPLETED });
      }
    }
  } catch {
    /**
     * TODO handle error
     */
  } finally {
    yield put(paymentResetLoadingState());
  }
}

export function* watchWalletSaga(
  sessionToken: SessionToken,
  pagoPaClient: PagoPaClient,
  storedPin: PinString
): Iterator<Effect> {
  const backendClient = BackendClient(
    apiUrlPrefix,
    sessionToken,
    pagopaFetch()
  );

  // backend client for polling for paymentId
  const pollingBackendClient = BackendClient(
    apiUrlPrefix,
    sessionToken,
    constantPollingFetch(MAX_RETRIES_POLLING, DELAY_BETWEEN_RETRIES_MS)
  );

  yield call(fetchAndStorePagoPaToken, pagoPaClient);

  yield takeLatest(
    PAYMENT_REQUEST_QR_CODE,
    paymentSagaFromQrCode,
    backendClient.getVerificaRpt,
    backendClient.postAttivaRpt,
    pollingBackendClient.getPaymentId,
    storedPin
  );
  yield takeLatest(
    PAYMENT_REQUEST_MESSAGE,
    paymentSagaFromMessage,
    backendClient.getVerificaRpt,
    backendClient.postAttivaRpt,
    pollingBackendClient.getPaymentId,
    storedPin
  );

  while (true) {
    const action:
      | FetchTransactionsRequest
      | FetchWalletsRequest
      | AddCreditCardRequest
      | LogoutSuccess
      | PaymentRequestQrCode
      | PaymentRequestMessage = yield take([
      FETCH_TRANSACTIONS_REQUEST,
      FETCH_WALLETS_REQUEST,
      LOGOUT_SUCCESS,
      PAYMENT_REQUEST_QR_CODE,
      PAYMENT_REQUEST_MESSAGE,
      ADD_CREDIT_CARD_REQUEST,
      LOGOUT_SUCCESS
    ]);

    if (action.type === FETCH_TRANSACTIONS_REQUEST) {
      yield fork(fetchTransactions, pagoPaClient);
    }
    if (action.type === FETCH_WALLETS_REQUEST) {
      yield fork(fetchWallets, pagoPaClient);
    }
    if (action.type === ADD_CREDIT_CARD_REQUEST) {
      yield fork(
        addCreditCard,
        action.creditCard,
        action.setAsFavorite, // should the card be set as favorite?
        pagoPaClient
      );
    }
    // if the user logs out, go back to waiting
    // for a WALLET_TOKEN_LOAD_SUCCESS action
    if (action.type === LOGOUT_SUCCESS) {
      break;
    }
  }
}
