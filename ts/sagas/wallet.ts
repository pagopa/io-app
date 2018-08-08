import { AmountInEuroCentsFromNumber } from "italia-ts-commons/lib/pagopa";

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

import { Option, some } from "fp-ts/lib/Option";
import { AmountInEuroCents, RptId } from "italia-ts-commons/lib/pagopa";
import { NavigationActions } from "react-navigation";
import { CodiceContestoPagamento } from "../../definitions/backend/CodiceContestoPagamento";
import { EnteBeneficiario } from "../../definitions/backend/EnteBeneficiario";
import { PaymentActivationsPostResponse } from "../../definitions/backend/PaymentActivationsPostResponse";
import { PaymentRequestsGetResponse } from "../../definitions/backend/PaymentRequestsGetResponse";
import { BackendClient, BasicResponseTypeWith401 } from "../api/backend";
import { PagoPaClient } from "../api/pagopa";
import { WalletAPI } from "../api/wallet/wallet-api";
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
  PAYMENT_UPDATE_PSP_IN_STATE,
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
  storeNewTransaction,
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
  getPaymentReason,
  getPaymentRecipient,
  getPspList,
  getRptId,
  getSelectedPaymentMethod,
  isGlobalStateWithPaymentId,
  selectedPaymentMethodSelector
} from "../store/reducers/wallet/payment";
import {
  feeExtractor,
  getFavoriteWalletId,
  specificWalletSelector
} from "../store/reducers/wallet/wallets";
import { Psp, Wallet } from "../types/pagopa";
import {
  SessionResponse,
  Transaction,
  TransactionListResponse,
  WalletListResponse
} from "../types/pagopa";
import { SessionToken } from "../types/SessionToken";
import {
  UNKNOWN_AMOUNT,
  UNKNOWN_PAYMENT_REASON,
  UNKNOWN_RECIPIENT
} from "../types/unknown";
import {
  AbortableFetch,
  toFetch,
  setFetchTimeout,
  retriableFetch
} from "italia-ts-commons/lib/fetch";
import { Millisecond } from "italia-ts-commons/lib/units";
import {
  withRetries,
  RetriableTask,
  MaxRetries,
  RetryAborted,
  TransientError
} from "italia-ts-commons/lib/tasks";
import { TaskEither, fromEither } from "fp-ts/lib/TaskEither";
import { left, right } from "fp-ts/lib/Either";

// allow refreshing token this number of times
const MAX_TOKEN_REFRESHES = 2;

function* fetchTransactions(
  pagoPaClient: PagoPaClient,
  token: string,
  retries: number = MAX_TOKEN_REFRESHES
): Iterator<Effect> {
  if (retries === 0) {
    // max retries reached
    // show "unauthorized" error @https://www.pivotaltracker.com/story/show/159400682
    return;
  }
  const response:
    | BasicResponseTypeWith401<TransactionListResponse>
    | undefined = yield call(pagoPaClient.getTransactions, token);
  if (response !== undefined) {
    if (response.status === 200) {
      // ok, all good
      yield put(transactionsFetched(response.value.data));
    } else if (response.status === 401) {
      // unauthorized -- try refreshing the token
      yield call(fetchPagoPaToken, pagoPaClient);
      // retrieve the newly stored token and use it for
      // the following request
      const newToken: Option<string> = yield select(getPagoPaToken);
      if (newToken.isSome()) {
        yield call(
          fetchTransactions,
          pagoPaClient,
          newToken.value,
          retries - 1
        );
      }
    }
    // else show an error modal @https://www.pivotaltracker.com/story/show/159400682
  }
}

function* fetchWallets(
  pagoPaClient: PagoPaClient,
  token: string,
  retries: number = MAX_TOKEN_REFRESHES
): Iterator<Effect> {
  const response:
    | BasicResponseTypeWith401<WalletListResponse>
    | undefined = yield call(pagoPaClient.getWallets, token);
  if (response !== undefined) {
    if (response.status === 200) {
      yield put(walletsFetched(response.value.data));
    } else if (response.status === 401) {
      // unauthorized -- try refreshing the token
      yield call(fetchPagoPaToken, pagoPaClient);
      const newToken: Option<string> = yield select(getPagoPaToken);
      if (newToken.isSome()) {
        yield call(fetchWallets, pagoPaClient, newToken.value, retries - 1);
      }
    }
    // else show an error modal @https://www.pivotaltracker.com/story/show/159400682
  }
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

function* showWalletOrSelectPsp(idWallet: number, paymentId?: string) {
  const wallet: Option<Wallet> = yield select(specificWalletSelector(idWallet));
  if (wallet.isSome()) {
    // TODO: fetch list of PSPs available here
    // @https://www.pivotaltracker.com/story/show/159494746
    const pspList = WalletAPI.getPsps();

    // show card
    // if multiple psps are available and one
    // has not yet been selected, show psp list
    if (pspList.length > 1 && wallet.value.psp === undefined) {
      // multiple choices here and no favorite wallet exists
      // show list of psps
      yield put(
        paymentId === undefined
          ? paymentPickPsp(wallet.value.idWallet, pspList)
          : paymentInitialPickPsp(wallet.value.idWallet, pspList, paymentId)
      );
      yield put(navigateTo(ROUTES.PAYMENT_PICK_PSP));
    } else {
      // only 1 choice of psp, or psp already selected (in previous transaction)
      yield put(
        paymentId === undefined
          ? paymentConfirmPaymentMethod(wallet.value.idWallet, pspList)
          : paymentInitialConfirmPaymentMethod(
              wallet.value.idWallet,
              pspList,
              paymentId
            )
      );
      yield put(navigateTo(ROUTES.PAYMENT_CONFIRM_PAYMENT_METHOD));
    }
  }
}

const MAX_RETRIES_POLLING = 20;
const DELAY_BETWEEN_RETRIES_MS = 1000;

//
// THIS IS AN EXAMPLE
//
// we build a fetch client that can be aborted for timeout
// most of this code can be shared in utils/fetch.ts, it's here for
// clarity
const abortableFetch = AbortableFetch(fetch);
const timeoutFetch = toFetch(
  setFetchTimeout(1000 as Millisecond, abortableFetch)
);
// use a constant backoff with MAX_RETRIES_POLLING
const constantBackoff = () => DELAY_BETWEEN_RETRIES_MS as Millisecond;
const retryLogic = withRetries<Error, Response>(
  MAX_RETRIES_POLLING,
  constantBackoff
);
// makes the retry logic map 404s to transient errors (by default only
// timeouts are transient)
// see also https://github.com/teamdigitale/italia-ts-commons/blob/master/src/fetch.ts#L103
const retryWithTransient404s: typeof retryLogic = (t, shouldAbort?) =>
  retryLogic(
    // when the result of the task is a Response with status 404,
    // map it to a transient error
    t.chain(r =>
      fromEither(
        r.status === 404
          ? left<TransientError, never>(TransientError)
          : right<never, Response>(r)
      )
    ),
    shouldAbort
  );

// this is a fetch with timeouts, constant backoff and with the logic
// that handles 404s as transient errors, this "fetch" must be passed to
// createFetchRequestForApi when creating "getPaymentId"
const pollingFetch = retriableFetch(retryWithTransient404s)(timeoutFetch);

//
// ---------
//

const pollForPaymentId = async (
  backendClient: ReturnType<typeof BackendClient>,
  p: { paymentContextCode: CodiceContestoPagamento },
  retries = MAX_RETRIES_POLLING
): Promise<string | undefined> => {
  if (retries === 0) {
    return undefined;
  }
  const response = await backendClient.getPaymentId(p);
  if (response === undefined) {
    return undefined;
  }
  if (response.status === 200) {
    return response.value.idPagamento;
  }
  if (response.status === 404) {
    await delay(DELAY_BETWEEN_RETRIES_MS);
    console.warn("waiting");
    return pollForPaymentId(backendClient, p, retries - 1);
  }
  return undefined;
};

// WIP: is this the appropriate place for this function?
const attivaRpt = async (
  sessionToken: SessionToken | undefined,
  rptId: RptId,
  paymentContextCode: CodiceContestoPagamento,
  amount: AmountInEuroCents
) => {
  if (sessionToken) {
    const backendClient = BackendClient(apiUrlPrefix, sessionToken);

    const response:
      | BasicResponseTypeWith401<PaymentActivationsPostResponse>
      | undefined = await backendClient.postAttivaRpt({
      rptId,
      paymentContextCode,
      amount
    });
    console.warn(response);
    if (response !== undefined && response.status === 200) {
      // successfully request the payment activation
      // now poll until a paymentId is made available
      return await pollForPaymentId(backendClient, { paymentContextCode });
    }
  }
  return undefined;
};

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
  const paymentId: string | undefined = hasPaymentId
    ? undefined
    : yield call(attivaRpt, sessionToken, rptId, paymentContextCode, amount);

  // in case  (paymentId === undefined && !hasPaymentId),
  // the payment id could not be fetched successfully. Handle
  // the error here @https://www.pivotaltracker.com/story/show/159400682

  if (favoriteWallet.isSome()) {
    yield call(
      showWalletOrSelectPsp,
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
  // this will either show the recap screen (if the selected
  // wallet already has a PSP), or it will show the
  // "pick psp" screen
  yield call(showWalletOrSelectPsp, walletId);
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
  // TODO: register action.paylod (pspId) as the
  // selected pspId for walletId (from getSelectedPaymentMethod)
  // then, refresh the list of available payment methods.
  // @https://www.pivotaltracker.com/story/show/159494746
  const pspList = WalletAPI.getPsps();
  const walletId: number = yield select(getSelectedPaymentMethod);
  const psp = pspList.find(p => p.id === action.payload);
  if (psp !== undefined) {
    yield put({ type: PAYMENT_UPDATE_PSP_IN_STATE, payload: psp, walletId });
  }
  yield put(paymentRequestConfirmPaymentMethod(walletId));

  // Finally, return to the list of psp handlers
}

function* completionHandler(_: PaymentRequestCompletion) {
  // -> it should proceed with the required operations
  // and terminate with the "new payment" screen

  // do payment stuff (-> pagoPA REST)
  // retrieve transaction and store it
  // mocked data here
  const wallet: Wallet = yield select(selectedPaymentMethodSelector);

  const selectedRecipient: Option<EnteBeneficiario> = yield select(
    getPaymentRecipient
  );
  const recipient = selectedRecipient.getOrElse(UNKNOWN_RECIPIENT);

  const selectedPaymentReason: Option<string> = yield select(getPaymentReason);
  const paymentReason = selectedPaymentReason.getOrElse(UNKNOWN_PAYMENT_REASON);

  const selectedCurrentAmount: AmountInEuroCents = yield select(
    getCurrentAmount
  );
  const amount =
    100 * AmountInEuroCentsFromNumber.encode(selectedCurrentAmount);
  const feeOrUndefined = feeExtractor(wallet);
  const fee =
    100 *
    AmountInEuroCentsFromNumber.encode(
      feeOrUndefined === undefined ? UNKNOWN_AMOUNT : feeOrUndefined
    );
  const now = new Date();

  const transaction: Transaction = {
    id: Math.floor(Math.random() * 1000),
    amount: {
      amount,
      currency: "EUR",
      currencyNumber: "1",
      decimalDigits: 2
    },
    created: now,
    description: paymentReason,
    error: false,
    fee: {
      amount: fee,
      currency: "EUR",
      currencyNumber: "1",
      decimalDigits: 2
    },
    grandTotal: {
      amount: amount + fee,
      currency: "EUR",
      currencyNumber: "1",
      decimalDigits: 2
    },
    idPayment: Math.floor(Math.random() * 1000),
    idPsp: 1,
    idStatus: 1,
    idWallet: wallet.idWallet,
    merchant: recipient.denominazioneBeneficiario,
    nodoIdPayment: "1",
    paymentModel: 1,
    statusMessage: "OK",
    success: true,
    token: "42",
    updated: now,
    urlCheckout3ds: "",
    urlRedirectPSP: ""
  };

  yield put(storeNewTransaction(transaction));
  yield put(selectTransactionForDetails(transaction));
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
  yield put({ type: PAYMENT_COMPLETED });
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
