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

import { Option } from "fp-ts/lib/Option";
import { AmountInEuroCents, RptId } from "italia-ts-commons/lib/pagopa";
import { NavigationActions } from "react-navigation";
import { CodiceContestoPagamento } from "../../definitions/backend/CodiceContestoPagamento";
import { EnteBeneficiario } from "../../definitions/backend/EnteBeneficiario";
import { Iban } from "../../definitions/backend/Iban";
import { ImportoEuroCents } from "../../definitions/backend/ImportoEuroCents";
import { PaymentRequestsGetResponse } from "../../definitions/backend/PaymentRequestsGetResponse";
import { BasicResponseTypeWith401 } from "../api/backend";
import { PagoPaClient } from "../api/pagopa";
import { pagoPaApiUrlPrefix } from "../config";
import ROUTES from "../navigation/routes";
import {
  FETCH_TRANSACTIONS_REQUEST,
  FETCH_WALLETS_REQUEST,
  PAYMENT_COMPLETED,
  PAYMENT_REQUEST_COMPLETION,
  PAYMENT_REQUEST_CONFIRM_PAYMENT_METHOD,
  PAYMENT_REQUEST_CONTINUE_WITH_PAYMENT_METHODS,
  PAYMENT_REQUEST_GO_BACK,
  PAYMENT_REQUEST_MANUAL_ENTRY,
  PAYMENT_REQUEST_PICK_PAYMENT_METHOD,
  PAYMENT_REQUEST_QR_CODE,
  PAYMENT_REQUEST_TRANSACTION_SUMMARY
} from "../store/actions/constants";
import {
  paymentConfirmPaymentMethod,
  paymentGoBack,
  paymentManualEntry,
  paymentPickPaymentMethod,
  paymentQrCode,
  PaymentRequestCompletion,
  paymentRequestConfirmPaymentMethod,
  PaymentRequestConfirmPaymentMethod,
  PaymentRequestContinueWithPaymentMethods,
  PaymentRequestGoBack,
  PaymentRequestManualEntry,
  PaymentRequestPickPaymentMethod,
  paymentRequestPickPaymentMethod,
  PaymentRequestTransactionSummaryActions,
  paymentTransactionSummaryFromBanner,
  paymentTransactionSummaryFromRptId
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
  getCurrentAmount,
  getPaymentReason,
  getPaymentRecipient,
  selectedPaymentMethodSelector
} from "../store/reducers/wallet/payment";
import {
  feeExtractor,
  getFavoriteWalletId
} from "../store/reducers/wallet/wallets";
import {
  Transaction,
  TransactionListResponse,
  WalletListResponse
} from "../types/pagopa";
import { Wallet } from "../types/pagopa";
import {
  UNKNOWN_AMOUNT,
  UNKNOWN_PAYMENT_REASON,
  UNKNOWN_RECIPIENT
} from "../types/unknown";

function* fetchTransactions(pagoPaClient: PagoPaClient): Iterator<Effect> {
  const response:
    | BasicResponseTypeWith401<TransactionListResponse>
    | undefined = yield call(pagoPaClient.getTransactions, {});
  if (response !== undefined && response.status === 200) {
    yield put(transactionsFetched(response.value.data));
  }
}

function* fetchWallets(pagoPaClient: PagoPaClient): Iterator<Effect> {
  const response:
    | BasicResponseTypeWith401<WalletListResponse>
    | undefined = yield call(pagoPaClient.getWallets, {});
  if (response !== undefined && response.status === 200) {
    yield put(walletsFetched(response.value.data));
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

function* watchPaymentSaga(): Iterator<Effect> {
  while (true) {
    const action = yield take([
      PAYMENT_REQUEST_QR_CODE,
      PAYMENT_REQUEST_MANUAL_ENTRY,
      PAYMENT_REQUEST_TRANSACTION_SUMMARY,
      PAYMENT_REQUEST_CONTINUE_WITH_PAYMENT_METHODS,
      PAYMENT_REQUEST_PICK_PAYMENT_METHOD,
      PAYMENT_REQUEST_CONFIRM_PAYMENT_METHOD,
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

    // TODO: fetch the data from the pagoPA proxy
    const verificaResponse: PaymentRequestsGetResponse = {
      importoSingoloVersamento: 10052 as ImportoEuroCents,
      codiceContestoPagamento: "6793ad707f9b11e888482902221575ae" as CodiceContestoPagamento,
      ibanAccredito: "IT17X0605502100000001234567" as Iban,
      causaleVersamento: "IMU 2018",
      enteBeneficiario: {
        identificativoUnivocoBeneficiario: "123",
        denominazioneBeneficiario: "Comune di Canicattì",
        codiceUnitOperBeneficiario: "01",
        denomUnitOperBeneficiario: "CDC",
        indirizzoBeneficiario: "Via Roma",
        civicoBeneficiario: "23",
        capBeneficiario: "92010",
        localitaBeneficiario: "Canicattì",
        provinciaBeneficiario: "Agrigento",
        nazioneBeneficiario: "IT"
      } as EnteBeneficiario
    };
    yield put(
      paymentTransactionSummaryFromRptId(rptId, initialAmount, verificaResponse)
    );
  } else {
    yield put(paymentTransactionSummaryFromBanner());
  }
  // also, show summary screen
  yield put(navigateTo(ROUTES.PAYMENT_TRANSACTION_SUMMARY));
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
  const favoriteCard: Option<number> = yield select(getFavoriteWalletId);
  if (favoriteCard.isSome()) {
    // show card
    yield put(paymentRequestConfirmPaymentMethod(favoriteCard.value));
  } else {
    // show list
    yield put(paymentRequestPickPaymentMethod());
  }
}

function* confirmPaymentMethodHandler(
  action: PaymentRequestConfirmPaymentMethod
) {
  const walletId = action.payload;
  yield put(paymentConfirmPaymentMethod(walletId));
  yield put(navigateTo(ROUTES.PAYMENT_CONFIRM_PAYMENT_METHOD));
}

function* pickPaymentMethodHandler(_: PaymentRequestPickPaymentMethod) {
  // show screen with list of payment methods available
  yield put(paymentPickPaymentMethod());
  yield put(navigateTo(ROUTES.PAYMENT_PICK_PAYMENT_METHOD));
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

function* watchWalletSaga(): Iterator<Effect> {
  const pagoPaClient = PagoPaClient(pagoPaApiUrlPrefix, "TOKEN");
  while (true) {
    const action = yield take([
      FETCH_TRANSACTIONS_REQUEST,
      FETCH_WALLETS_REQUEST
    ]);
    if (action.type === FETCH_TRANSACTIONS_REQUEST) {
      yield fork(fetchTransactions, pagoPaClient);
    }
    if (action.type === FETCH_WALLETS_REQUEST) {
      yield fork(fetchWallets, pagoPaClient);
    }
  }
}

/**
 * saga that manages the wallet (transactions + credit cards)
 */
// TOOD: currently using the mocked API. This will be wrapped by
// a saga that retrieves the required token and uses it to build
// a client to make the requests, @https://www.pivotaltracker.com/story/show/158068259
export default function* root(): Iterator<Effect> {
  yield fork(watchWalletSaga);
  yield takeLatest(PAYMENT_REQUEST_QR_CODE, paymentSagaFromQrCode);
}
