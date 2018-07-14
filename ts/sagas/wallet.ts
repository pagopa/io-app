import { AmountInEuroCentsFromNumber } from "italia-ts-commons/lib/pagopa";
import { PAYMENT_VERIFY_OTP } from "./../store/actions/constants";
import {
  currentAmountSelector,
  feeExtractor,
  paymentReasonSelector,
  paymentRecipientSelector,
  selectedPaymentMethodSelector
} from "./../store/reducers/wallet/payment";
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
import { CodiceContestoPagamento } from "../../definitions/pagopa-proxy/CodiceContestoPagamento";
import { EnteBeneficiario } from "../../definitions/pagopa-proxy/EnteBeneficiario";
import { Iban } from "../../definitions/pagopa-proxy/Iban";
import { ImportoEuroCents } from "../../definitions/pagopa-proxy/ImportoEuroCents";
import { PaymentRequestsGetResponse } from "../../definitions/pagopa-proxy/PaymentRequestsGetResponse";
import { Wallet } from "../../definitions/pagopa/Wallet";
import { WalletAPI } from "../api/wallet/wallet-api";
import ROUTES from "../navigation/routes";
import {
  FETCH_TRANSACTIONS_REQUEST,
  FETCH_WALLETS_REQUEST,
  PAYMENT_COMPLETED,
  PAYMENT_CONFIRM_PAYMENT_METHOD,
  PAYMENT_CONFIRM_SUMMARY,
  PAYMENT_INSERT_DATA_MANUALLY,
  PAYMENT_PICK_PAYMENT_METHOD,
  PAYMENT_REQUEST_OTP,
  PAYMENT_SHOW_SUMMARY,
  PAYMENT_START
} from "../store/actions/constants";
import { Action } from "../store/actions/types";
import {
  confirmPaymentMethod,
  pickPaymentMethod,
  storeInitialAmount,
  storeRptIdData,
  storeSelectedPaymentMethod,
  storeVerificaResponse
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
import { getFavoriteWalletId } from "../store/reducers/wallet/wallets";
import { getWalletId } from "../types/CreditCard";
import {
  UNKNOWN_AMOUNT,
  UNKNOWN_CARD,
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

function* paymentSaga(): Iterator<Effect> {
  yield put(navigateTo(ROUTES.PAYMENT_SCAN_QR_CODE)); // start by showing qr code scanner

  while (true) {
    const action = yield take([
      PAYMENT_INSERT_DATA_MANUALLY,
      PAYMENT_SHOW_SUMMARY,
      PAYMENT_CONFIRM_SUMMARY,
      PAYMENT_PICK_PAYMENT_METHOD,
      PAYMENT_CONFIRM_PAYMENT_METHOD,
      PAYMENT_REQUEST_OTP,
      PAYMENT_VERIFY_OTP,
      PAYMENT_COMPLETED
    ]);
    if (action.type === PAYMENT_COMPLETED) {
      break;
    }
    yield fork(handlePaymentActions, action);
  }
}
function* handlePaymentActions(action: Action): Iterator<Effect> {
  if (action.type === PAYMENT_INSERT_DATA_MANUALLY) {
    // from the QR code screen the user selected
    // the option for entering the data manually
    // -> navigate to manual data insertion screen
    yield put(navigateTo(ROUTES.PAYMENT_MANUAL_DATA_INSERTION));
  }
  if (action.type === PAYMENT_SHOW_SUMMARY) {
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
      yield put(storeRptIdData(rptId));
      yield put(storeInitialAmount(initialAmount));

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
      yield put(storeVerificaResponse(verificaResponse));
    }

    // also, show summary screen
    yield put(navigateTo(ROUTES.PAYMENT_TRANSACTION_SUMMARY));
  }
  if (action.type === PAYMENT_CONFIRM_SUMMARY) {
    // find out whether a payment method has already
    // been defined as favorite. If so, use it and
    // ask the user to confirm it
    // Otherwise, show a list of payment methods available
    // TODO: if no payment method is available (or if the
    // user chooses to do so), allow adding a new one.
    const favoriteCard: Option<number> = yield select(getFavoriteWalletId);
    if (favoriteCard.isSome()) {
      // show card
      yield put(confirmPaymentMethod(favoriteCard.value));
    } else {
      // show list
      yield put(pickPaymentMethod());
    }
  }
  if (action.type === PAYMENT_PICK_PAYMENT_METHOD) {
    // show screen with list of payment methods available
    yield put(navigateTo(ROUTES.PAYMENT_PICK_PAYMENT_METHOD));
  }
  if (action.type === PAYMENT_CONFIRM_PAYMENT_METHOD) {
    const cardId = action.payload;
    yield put(storeSelectedPaymentMethod(cardId));
    yield put(navigateTo(ROUTES.PAYMENT_CONFIRM_PAYMENT_METHOD));
  }
  if (action.type === PAYMENT_REQUEST_OTP) {
    // a payment method has been selected.
    // TODO
    // -> do the "attiva" here (-> pagoPA proxy)
    // -> Request OTP /v1/users/actions/send-otp ? (-> pagoPA REST)
    yield put(navigateTo(ROUTES.PAYMENT_TEXT_VERIFICATION));
  }
  if (action.type === PAYMENT_VERIFY_OTP) {
    // TODO contact server & send OTP -> action.payload (-> pagoPA REST)
    // temporary check: if OTP is empty, fail
    if (action.payload !== "") {
      // do payment stuff? (-> pagoPA REST)
      // retrieve transaction and store it
      // mocked data here
      const card: Wallet = (yield select(
        selectedPaymentMethodSelector
      )).getOrElse(UNKNOWN_CARD);
      const transaction: WalletTransaction = {
        id: Math.floor(Math.random() * 1000),
        cardId: getWalletId(card),
        isoDatetime: new Date().toISOString(),
        paymentReason: (yield select(paymentReasonSelector)).getOrElse("???"),
        recipient: (yield select(paymentRecipientSelector)).getOrElse(
          UNKNOWN_RECIPIENT
        ).denominazioneBeneficiario,
        amount: AmountInEuroCentsFromNumber.encode(
          ((yield select(currentAmountSelector)) as Option<
            AmountInEuroCents
          >).getOrElse(UNKNOWN_AMOUNT)
        ),
        currency: "EUR",
        transactionCost: AmountInEuroCentsFromNumber.encode(
          feeExtractor(card).getOrElse(UNKNOWN_AMOUNT)
        ),
        isNew: true
      };
      yield put(storeNewTransaction(transaction));
      yield put(selectTransactionForDetails(transaction));
      yield put(selectWalletForDetails(card.id)); // for the banner
      yield put(
        navigateTo(ROUTES.WALLET_TRANSACTION_DETAILS, {
          paymentCompleted: true
        })
      );
      yield put({ type: PAYMENT_COMPLETED });
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
  yield takeLatest(PAYMENT_START, paymentSaga);
}
