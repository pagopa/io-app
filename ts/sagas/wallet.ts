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
import { Wallet } from "../../definitions/pagopa/Wallet";
import { WalletAPI } from "../api/wallet/wallet-api";
import ROUTES from "../navigation/routes";
import {
  FETCH_TRANSACTIONS_REQUEST,
  FETCH_WALLETS_REQUEST,
  PAYMENT_COMPLETED,
  PAYMENT_REQUEST_COMPLETION,
  PAYMENT_REQUEST_CONFIRM_PAYMENT_METHOD,
  PAYMENT_REQUEST_CONTINUE_WITH_PAYMENT_METHODS,
  PAYMENT_REQUEST_MANUAL_ENTRY,
  PAYMENT_REQUEST_PICK_PAYMENT_METHOD,
  PAYMENT_REQUEST_QR_CODE,
  PAYMENT_REQUEST_TRANSACTION_SUMMARY
} from "../store/actions/constants";
import {
  paymentConfirmPaymentMethod,
  paymentManualEntry,
  paymentPickPaymentMethod,
  paymentQrCode,
  PaymentRequestCompletion,
  paymentRequestConfirmPaymentMethod,
  PaymentRequestConfirmPaymentMethod,
  PaymentRequestContinueWithPaymentMethods,
  PaymentRequestManualEntry,
  paymentRequestPickPaymentMethod,
  PaymentRequestPickPaymentMethod,
  PaymentRequestTransactionSummary,
  paymentTransactionSummary
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
import { getWalletId } from "../types/CreditCard";
import {
  UNKNOWN_AMOUNT,
  UNKNOWN_PAYMENT_REASON,
  UNKNOWN_RECIPIENT
} from "../types/unknown";
import { WalletTransaction } from "../types/wallet";

function* fetchTransactions(
  loadTransactions: () => Promise<ReadonlyArray<WalletTransaction>>
): Iterator<Effect> {
  const transactions: ReadonlyArray<WalletTransaction> = yield call(
    loadTransactions
  );
  yield put(transactionsFetched(transactions));
}

function* fetchCreditCards(
  loadCards: () => Promise<ReadonlyArray<Wallet>>
): Iterator<Effect> {
  const cards: ReadonlyArray<Wallet> = yield call(loadCards);
  yield put(walletsFetched(cards));
}

const navigateTo = (routeName: string, params?: object) => {
  return NavigationActions.navigate({ routeName, params });
};

function* paymentSagaFromQrCode(): Iterator<Effect> {
  yield put(paymentQrCode());
  yield put(navigateTo(ROUTES.PAYMENT_SCAN_QR_CODE)); // start by showing qr code scanner
  yield fork(paymentSaga);
}

function* paymentSaga(): Iterator<Effect> {
  while (true) {
    const action = yield take([
      PAYMENT_REQUEST_QR_CODE,
      PAYMENT_REQUEST_MANUAL_ENTRY,
      PAYMENT_REQUEST_TRANSACTION_SUMMARY,
      PAYMENT_REQUEST_CONTINUE_WITH_PAYMENT_METHODS,
      PAYMENT_REQUEST_PICK_PAYMENT_METHOD,
      PAYMENT_REQUEST_CONFIRM_PAYMENT_METHOD,
      PAYMENT_REQUEST_COMPLETION,
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
    }
  }
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
  action: PaymentRequestTransactionSummary
) {
  // the user may have gotten here from the QR code,
  // the manual data entry, from a message OR by
  // tapping on the payment banner further in the process.
  // in all cases but the last one, a payload will be
  // provided, and it will contain the RptId information
  if (action.payload !== undefined) {
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
      paymentTransactionSummary(rptId, initialAmount, verificaResponse)
    );
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
  // tslint:disable-next-line saga-yield-return-type
  const wallet: Wallet = yield select(selectedPaymentMethodSelector);
  // tslint:disable-next-line saga-yield-return-type
  const recipient = (yield select(getPaymentRecipient)).getOrElse(
    UNKNOWN_RECIPIENT
  );
  // tslint:disable-next-line saga-yield-return-type
  const paymentReason = (yield select(getPaymentReason)).getOrElse(
    UNKNOWN_PAYMENT_REASON
  );
  const fee = feeExtractor(wallet);

  const transaction: WalletTransaction = {
    id: Math.floor(Math.random() * 1000),
    cardId: wallet.idWallet === undefined ? -1 : wallet.idWallet,
    isoDatetime: new Date().toISOString(),
    paymentReason:
      paymentReason === undefined ? UNKNOWN_PAYMENT_REASON : paymentReason,
    recipient: (recipient === undefined ? UNKNOWN_RECIPIENT : recipient)
      .denominazioneBeneficiario,
    amount: AmountInEuroCentsFromNumber.encode(
      yield select(getCurrentAmount) // tslint:disable-line saga-yield-return-type
    ),
    currency: "EUR",
    transactionCost: AmountInEuroCentsFromNumber.encode(
      fee === undefined ? UNKNOWN_AMOUNT : fee
    ),
    isNew: true
  };
  yield put(storeNewTransaction(transaction));
  yield put(selectTransactionForDetails(transaction));
  yield put(selectWalletForDetails(getWalletId(wallet))); // for the banner
  yield put(
    navigateTo(ROUTES.WALLET_TRANSACTION_DETAILS, {
      paymentCompleted: true
    })
  );
  yield put({ type: PAYMENT_COMPLETED });
}

/**
 * saga that manages the wallet (transactions + credit cards)
 */
// TOOD: currently using the mocked API. This will be wrapped by
// a saga that retrieves the required token and uses it to build
// a client to make the requests, @https://www.pivotaltracker.com/story/show/158068259
export default function* root(): Iterator<Effect> {
  yield takeLatest(
    FETCH_TRANSACTIONS_REQUEST,
    fetchTransactions,
    WalletAPI.getTransactions
  );
  yield takeLatest(
    FETCH_WALLETS_REQUEST,
    fetchCreditCards,
    WalletAPI.getWallets
  );
  yield takeLatest(PAYMENT_REQUEST_QR_CODE, paymentSagaFromQrCode);
}
