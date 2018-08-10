import { RptIdFromString } from "italia-ts-commons/lib/pagopa";

/**
 * A saga that manages the Wallet.
 */

import {
  call,
  Effect,
  fork,
  put,
  select,
  take,
  takeLatest
} from "redux-saga/effects";

import { none, Option, some } from "fp-ts/lib/Option";
import { AmountInEuroCents, RptId } from "italia-ts-commons/lib/pagopa";
import { NavigationActions } from "react-navigation";
import { CodiceContestoPagamento } from "../../definitions/backend/CodiceContestoPagamento";
import { PaymentActivationsPostResponse } from "../../definitions/backend/PaymentActivationsPostResponse";
import { PaymentRequestsGetResponse } from "../../definitions/backend/PaymentRequestsGetResponse";
import { PaymentResponse } from "../../definitions/pagopa/PaymentResponse";
import {
  BasicResponseTypeWith401,
  MockedBackendClient as BackendClient
} from "../api/backend";
import { PagoPaClient } from "../api/pagopa";
import { apiUrlPrefix, pagoPaApiUrlPrefix } from "../config";
import ROUTES from "../navigation/routes";
import {
  FETCH_TRANSACTIONS_REQUEST,
  FETCH_WALLETS_REQUEST,
  LOGOUT_SUCCESS,
  PAYMENT_COMPLETED,
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
  PAYMENT_UPDATE_PSP,
  WALLET_TOKEN_LOAD_SUCCESS
} from "../store/actions/constants";
import { storePagoPaToken } from "../store/actions/wallet/pagopa";
import {
  paymentConfirmPaymentMethod,
  paymentGoBack,
  paymentInitialConfirmPaymentMethod,
  paymentInitialPickPaymentMethod,
  paymentInitialPickPsp,
  paymentManualEntry,
  paymentPickPaymentMethod,
  paymentPickPsp,
  paymentQrCode,
  PaymentRequestCompletion,
  paymentRequestConfirmPaymentMethod,
  PaymentRequestConfirmPaymentMethod,
  PaymentRequestContinueWithPaymentMethods,
  PaymentRequestGoBack,
  PaymentRequestManualEntry,
  PaymentRequestPickPaymentMethod,
  PaymentRequestPickPsp,
  PaymentRequestTransactionSummaryActions,
  paymentTransactionSummaryFromBanner,
  paymentTransactionSummaryFromRptId,
  PaymentUpdatePsp
} from "../store/actions/wallet/payment";
import {
  selectTransactionForDetails,
  transactionsFetched
} from "../store/actions/wallet/transactions";
import {
  selectWalletForDetails,
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
  specificWalletSelector
} from "../store/reducers/wallet/wallets";
import {
  SessionResponse,
  Transaction,
  TransactionListResponse,
  WalletListResponse
} from "../types/pagopa";
import {
  Psp,
  PspListResponse,
  TransactionResponse,
  Wallet,
  WalletResponse
} from "../types/pagopa";
import { SessionToken } from "../types/SessionToken";
import { amountToImportoWithFallback } from "../utils/amounts";
import { pollingFetch } from "../utils/fetch";

// allow refreshing token this number of times
const MAX_TOKEN_REFRESHES = 2;

// this function tries to carry out the provided
// request, and refreshes the pagoPA token if a 401
// is returned. Upon refreshing, it tries to
// re-fetch the contents again for a maximum of
// MAX_TOKEN_REFRESHES times.
// If the request is successful (i.e. it does not
// return a 401), the successful token is returned
// along with the response (the caller will then
// decide what to do with it)
const fetchWithTokenRefresh = async <T>(
  request: (
    pagoPaToken: string
  ) => Promise<BasicResponseTypeWith401<T> | undefined>,
  tokenRefresher: (walletToken: string) => Promise<Option<string>>,
  walletToken: string,
  token: Option<string>,
  retries: number = MAX_TOKEN_REFRESHES
): Promise<[string, BasicResponseTypeWith401<T>] | undefined> => {
  if (retries === 0) {
    return undefined;
  }
  const pagoPaToken = token.isNone()
    ? await tokenRefresher(walletToken)
    : token;
  if (pagoPaToken.isNone()) {
    return undefined;
  }
  const response: BasicResponseTypeWith401<T> | undefined = await request(
    pagoPaToken.value
  );
  if (response !== undefined) {
    if (response.status !== 401) {
      // return code is not 401, the token
      // has been "accepted" (the caller will
      // then handle other error codes)
      return [pagoPaToken.value, response];
    } else {
      const newToken = await tokenRefresher(walletToken);
      if (newToken.isSome()) {
        return await fetchWithTokenRefresh(
          request,
          tokenRefresher,
          walletToken,
          newToken,
          retries - 1
        );
      }
    }
  }
  return undefined;
};

const refreshToken = async (walletToken: string): Promise<Option<string>> => {
  const pagoPaClient = PagoPaClient(pagoPaApiUrlPrefix);
  const response:
    | BasicResponseTypeWith401<SessionResponse>
    | undefined = await pagoPaClient.getSession(walletToken);
  if (response !== undefined && response.status === 200) {
    // token fetched successfully, return it
    return some(response.value.data.sessionToken);
  }
  return none;
};

function* fetchTransactions(pagoPaClient: PagoPaClient): Iterator<Effect> {
  const walletToken: Option<string> = yield select(walletTokenSelector);
  const token: Option<string> = yield select(getPagoPaToken);
  if (walletToken.isSome()) {
    const tokenAndResponseOrUndefined:
      | [string, BasicResponseTypeWith401<TransactionListResponse>]
      | undefined = yield call(
      fetchWithTokenRefresh,
      pagoPaClient.getTransactions,
      refreshToken,
      walletToken.value,
      token
    );
    if (tokenAndResponseOrUndefined !== undefined) {
      const [newToken, response] = tokenAndResponseOrUndefined;
      if (response.status === 200) {
        if (token.isNone() || newToken !== token.value) {
          yield put(storePagoPaToken(some(newToken)));
        }
        yield put(transactionsFetched(response.value.data));
        return;
      }
    }
  }
  // else show an error modal @https://www.pivotaltracker.com/story/show/159400682
}

function* fetchWallets(pagoPaClient: PagoPaClient): Iterator<Effect> {
  const walletToken: Option<string> = yield select(walletTokenSelector);
  const token: Option<string> = yield select(getPagoPaToken);
  if (walletToken.isSome()) {
    const tokenAndResponseOrUndefined:
      | [string, BasicResponseTypeWith401<WalletListResponse>]
      | undefined = yield call(
      fetchWithTokenRefresh,
      pagoPaClient.getWallets,
      refreshToken,
      walletToken.value,
      token
    );
    if (tokenAndResponseOrUndefined !== undefined) {
      const [newToken, response] = tokenAndResponseOrUndefined;
      if (response.status === 200) {
        if (token.isNone() || newToken !== token.value) {
          yield put(storePagoPaToken(some(newToken)));
        }
        yield put(walletsFetched(response.value.data));
      }
    }
  }
  // else show an error modal @https://www.pivotaltracker.com/story/show/159400682
}

const navigateTo = (routeName: string, params?: object) => {
  return NavigationActions.navigate({ routeName, params });
};

function* paymentSagaFromQrCode(): Iterator<Effect> {
  yield put(paymentQrCode());
  yield put(navigateTo(ROUTES.PAYMENT_SCAN_QR_CODE)); // start by showing qr code scanner
  yield fork(watchPaymentSaga);
}

function* paymentSagaFromMessage(): Iterator<Effect> {
  yield fork(watchPaymentSaga);
}

function* watchPaymentSaga(): Iterator<Effect> {
  while (true) {
    const action = yield take([
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
      PAYMENT_COMPLETED
    ]);
    if (action.type === PAYMENT_COMPLETED) {
      break;
    }

    switch (action.type) {
      case PAYMENT_REQUEST_MANUAL_ENTRY: {
        yield fork(enterDataManuallyHandler, action);
        break;
      }
      case PAYMENT_REQUEST_TRANSACTION_SUMMARY: {
        yield fork(showTransactionSummaryHandler, action);
        break;
      }
      case PAYMENT_REQUEST_CONTINUE_WITH_PAYMENT_METHODS: {
        yield fork(continueWithPaymentMethodsHandler, action);
        break;
      }
      case PAYMENT_REQUEST_PICK_PAYMENT_METHOD: {
        yield fork(pickPaymentMethodHandler, action);
        break;
      }
      case PAYMENT_REQUEST_CONFIRM_PAYMENT_METHOD: {
        yield fork(confirmPaymentMethodHandler, action);
        break;
      }
      case PAYMENT_REQUEST_PICK_PSP: {
        yield fork(pickPspHandler, action);
        break;
      }
      case PAYMENT_UPDATE_PSP: {
        yield fork(updatePspHandler, action);
        break;
      }
      case PAYMENT_REQUEST_COMPLETION: {
        yield fork(completionHandler, action);
        break;
      }
      case PAYMENT_REQUEST_GO_BACK: {
        yield fork(goBackHandler, action);
        break;
      }
    }
  }
}

function* goBackHandler(_: PaymentRequestGoBack) {
  yield put(paymentGoBack()); // return to previous state
  yield put(NavigationActions.back());
}

function* enterDataManuallyHandler(
  _: PaymentRequestManualEntry
): Iterator<Effect> {
  // from the QR code screen the user selected
  // the option for entering the data manually
  // -> navigate to manual data insertion screen
  yield put(paymentManualEntry());
  yield put(navigateTo(ROUTES.PAYMENT_MANUAL_DATA_INSERTION));
}

function* showTransactionSummaryHandler(
  action: PaymentRequestTransactionSummaryActions
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

    const sessionToken: SessionToken | undefined = yield select(
      sessionTokenSelector
    );
    if (sessionToken) {
      const backendClient = BackendClient(apiUrlPrefix, sessionToken);
      const response:
        | BasicResponseTypeWith401<PaymentRequestsGetResponse>
        | undefined = yield call(backendClient.getVerificaRpt, { rptId });
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
    } // TODO else manage errors @https://www.pivotaltracker.com/story/show/159400682
  } else {
    yield put(paymentTransactionSummaryFromBanner());
  }
  // also, show summary screen
  yield put(navigateTo(ROUTES.PAYMENT_TRANSACTION_SUMMARY));
}

function* showWalletOrSelectPsp(
  pagoPaClient: PagoPaClient,
  idWallet: number,
  paymentIdOrUndefined?: string
): Iterator<Effect> {
  const wallet: Option<Wallet> = yield select(specificWalletSelector(idWallet));
  if (wallet.isSome()) {
    const paymentId =
      paymentIdOrUndefined === undefined
        ? yield select(getPaymentId)
        : paymentIdOrUndefined;
    const walletToken: Option<string> = yield select(walletTokenSelector);
    const token: Option<string> = yield select(getPagoPaToken);
    let pspList: ReadonlyArray<Psp> = []; // tslint:disable-line: no-let

    if (walletToken.isSome()) {
      const tokenAndResponseOrUndefined:
        | [string, BasicResponseTypeWith401<PspListResponse>]
        | undefined = yield call(
        fetchWithTokenRefresh,
        (pagoPaToken: string) =>
          pagoPaClient.getPspList(pagoPaToken, paymentId),
        refreshToken,
        walletToken.value,
        token
      );
      if (tokenAndResponseOrUndefined !== undefined) {
        const [newToken, response] = tokenAndResponseOrUndefined;
        if (response.status === 200) {
          if (token.isNone() || newToken !== token.value) {
            yield put(storePagoPaToken(some(newToken)));
          }
          pspList = response.value.data;
        }
      }
    }
    // show card
    // if multiple psps are available and one
    // has not yet been selected, show psp list
    if (
      pspList.length > 1 &&
      (wallet.value.psp === undefined ||
        pspList.filter(
          p => wallet.value.psp !== undefined && p.id === wallet.value.psp.id // check for "undefined" only used to correctly typeguard
        ).length === undefined)
    ) {
      // multiple choices here and no favorite psp exists (or one exists
      // and it is not available for this payment)
      // show list of psps
      yield put(
        paymentIdOrUndefined === undefined
          ? paymentPickPsp(wallet.value.idWallet, pspList)
          : paymentInitialPickPsp(
              wallet.value.idWallet,
              pspList,
              paymentIdOrUndefined
            )
      );
      yield put(navigateTo(ROUTES.PAYMENT_PICK_PSP));
    } else {
      // only 1 choice of psp, or psp already selected (in previous transaction)
      yield put(
        paymentIdOrUndefined === undefined
          ? paymentConfirmPaymentMethod(wallet.value.idWallet, pspList)
          : paymentInitialConfirmPaymentMethod(
              wallet.value.idWallet,
              pspList,
              paymentIdOrUndefined
            )
      );
      yield put(navigateTo(ROUTES.PAYMENT_CONFIRM_PAYMENT_METHOD));
    }
  }
}

const MAX_RETRIES_POLLING = 20;
const DELAY_BETWEEN_RETRIES_MS = 1000;

// handle the "attiva" API call
const attivaRpt = async (
  sessionToken: SessionToken,
  rptId: RptId,
  paymentContextCode: CodiceContestoPagamento,
  amount: AmountInEuroCents
): Promise<boolean> => {
  const backendClient = BackendClient(apiUrlPrefix, sessionToken);

  const response:
    | BasicResponseTypeWith401<PaymentActivationsPostResponse>
    | undefined = await backendClient.postAttivaRpt({
    rptId: RptIdFromString.encode(rptId),
    paymentContextCode,
    amount: amountToImportoWithFallback(amount)
  });
  return response !== undefined && response.status === 200;
};

// handle the polling
const fetchPaymentId = async (
  sessionToken: SessionToken,
  paymentContextCode: CodiceContestoPagamento
): Promise<string | undefined> => {
  // successfully request the payment activation
  // now poll until a paymentId is made available
  const backendClient = BackendClient(
    apiUrlPrefix,
    sessionToken,
    pollingFetch(MAX_RETRIES_POLLING, DELAY_BETWEEN_RETRIES_MS)
  );
  const response = await backendClient.getPaymentId({ paymentContextCode });
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
  sessionToken: SessionToken,
  rptId: RptId,
  paymentContextCode: CodiceContestoPagamento,
  amount: AmountInEuroCents
): Promise<string | undefined> => {
  const attivaRptResult = await attivaRpt(
    sessionToken,
    rptId,
    paymentContextCode,
    amount
  );
  if (!attivaRptResult) {
    return undefined;
  }
  return await fetchPaymentId(sessionToken, paymentContextCode);
};

function* checkPayment(
  pagoPaClient: PagoPaClient,
  paymentId: string
): Iterator<Effect> {
  const walletToken: Option<string> = yield select(walletTokenSelector);
  const token: Option<string> = yield select(getPagoPaToken);
  if (walletToken.isSome()) {
    const tokenAndResponseOrUndefined:
      | [string, BasicResponseTypeWith401<PaymentResponse>]
      | undefined = yield call(
      fetchWithTokenRefresh,
      (t: string) => pagoPaClient.checkPayment(t, paymentId),
      refreshToken,
      walletToken.value,
      token
    );
    if (tokenAndResponseOrUndefined !== undefined) {
      const [newToken, response] = tokenAndResponseOrUndefined;
      if (response.status === 200) {
        if (token.isNone() || token.value !== newToken) {
          yield put(storePagoPaToken(some(newToken)));
        }
      }
    }
  }
  // else show an error modal @https://www.pivotaltracker.com/story/show/159400682
}

function* continueWithPaymentMethodsHandler(
  _: PaymentRequestContinueWithPaymentMethods
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
  const paymentId: string | undefined =
    hasPaymentId || sessionToken === undefined
      ? undefined
      : yield call(
          attivaAndGetPaymentId,
          sessionToken,
          rptId,
          paymentContextCode,
          amount
        );

  const pagoPaClient: PagoPaClient = PagoPaClient(pagoPaApiUrlPrefix);
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
  action: PaymentRequestConfirmPaymentMethod
) {
  const walletId = action.payload;
  const pagoPaClient = PagoPaClient(pagoPaApiUrlPrefix);
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

function* pickPspHandler(_: PaymentRequestPickPsp) {
  const walletId: number = yield select(getSelectedPaymentMethod);
  const pspList: ReadonlyArray<Psp> = yield select(getPspList);

  yield put(paymentPickPsp(walletId, pspList));
  yield put(navigateTo(ROUTES.PAYMENT_PICK_PSP));
}

function* updatePspHandler(action: PaymentUpdatePsp) {
  // First update the selected wallet (walletId) with the
  // new PSP (action.payload); then request a new list
  // of wallets (which will contain the updated PSP)
  const walletId: number = yield select(getSelectedPaymentMethod);
  const pagoPaClient = PagoPaClient(pagoPaApiUrlPrefix);
  const walletToken: Option<string> = yield select(walletTokenSelector);
  const token: Option<string> = yield select(getPagoPaToken);
  if (walletToken.isSome()) {
    const tokenAndResponseOrUndefined:
      | [string, BasicResponseTypeWith401<WalletResponse>]
      | undefined = yield call(
      fetchWithTokenRefresh,
      (pagoPaToken: string) =>
        pagoPaClient.updateWalletPsp(pagoPaToken, walletId, action.payload),
      refreshToken,
      walletToken.value,
      token
    );
    if (tokenAndResponseOrUndefined !== undefined) {
      const [newToken, response] = tokenAndResponseOrUndefined;
      if (response.status === 200) {
        if (token.isNone() || newToken !== token.value) {
          yield put(storePagoPaToken(some(newToken)));
        }
        // request new wallets (expecting to get the
        // same ones as before, with the selected one's
        // PSP set to the new one)
        yield call(fetchWallets, pagoPaClient, newToken);
        yield put(paymentRequestConfirmPaymentMethod(walletId));
      }
    }
  }

  // Finally, return to the list of psp handlers
}

function* completionHandler(_: PaymentRequestCompletion) {
  // -> it should proceed with the required operations
  // and terminate with the "new payment" screen
  const walletId: number = yield select(getSelectedPaymentMethod);
  const pagoPaClient = PagoPaClient(pagoPaApiUrlPrefix);
  const walletToken: Option<string> = yield select(walletTokenSelector);
  const token: Option<string> = yield select(getPagoPaToken);
  const paymentId: string = yield select(getPaymentId);

  if (walletToken.isSome()) {
    const tokenAndResponseOrUndefined:
      | [string, BasicResponseTypeWith401<TransactionResponse>]
      | undefined = yield call(
      fetchWithTokenRefresh,
      (pagoPaToken: string) =>
        pagoPaClient.postPayment(pagoPaToken, paymentId, walletId),
      refreshToken,
      walletToken.value,
      token
    );
    if (tokenAndResponseOrUndefined !== undefined) {
      const [newToken, response] = tokenAndResponseOrUndefined;
      if (response.status === 200) {
        if (token.isNone() || newToken !== token.value) {
          yield put(storePagoPaToken(some(newToken)));
        }
        // request all transactions (expecting to get the
        // same ones as before, plus the newly created one
        // (the reason for this is because newTransaction contains
        // a payment with status "processing", while the
        // value returned here contains the "completed" status
        // upon successful payment
        const newTransaction: Transaction = response.value.data;
        yield call(fetchTransactions, pagoPaClient, newToken);
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
  }
}

function* fetchPagoPaToken(pagoPaClient: PagoPaClient): Iterator<Effect> {
  const token: Option<string> = yield select(walletTokenSelector);
  if (token.isSome()) {
    const response:
      | BasicResponseTypeWith401<SessionResponse>
      | undefined = yield call(pagoPaClient.getSession, token.value);
    if (response !== undefined && response.status === 200) {
      // token fetched successfully, store it
      yield put(storePagoPaToken(some(response.value.data.sessionToken)));
    }
  }
}

function* watchWalletSaga(): Iterator<Effect> {
  while (true) {
    yield take(WALLET_TOKEN_LOAD_SUCCESS);

    const pagoPaClient: PagoPaClient = PagoPaClient(pagoPaApiUrlPrefix);
    yield call(fetchPagoPaToken, pagoPaClient);

    while (true) {
      const action = yield take([
        FETCH_TRANSACTIONS_REQUEST,
        FETCH_WALLETS_REQUEST,
        LOGOUT_SUCCESS
      ]);
      const pagoPaToken: Option<string> = yield select(getPagoPaToken);

      if (action.type === FETCH_TRANSACTIONS_REQUEST && pagoPaToken.isSome()) {
        yield fork(fetchTransactions, pagoPaClient, pagoPaToken.value);
      }
      if (action.type === FETCH_WALLETS_REQUEST && pagoPaToken.isSome()) {
        yield fork(fetchWallets, pagoPaClient, pagoPaToken.value);
      }
      // if the user logs out, go back to waiting
      // for a WALLET_TOKEN_LOAD_SUCCESS action
      if (action.type === LOGOUT_SUCCESS) {
        break;
      }
    }
  }
}

/**
 * saga that manages the wallet (transactions + wallets + payments)
 */
export default function* root(): Iterator<Effect> {
  yield fork(watchWalletSaga);
  yield takeLatest(PAYMENT_REQUEST_QR_CODE, paymentSagaFromQrCode);
  yield takeLatest(PAYMENT_REQUEST_MESSAGE, paymentSagaFromMessage);
}
