/**
 * A saga that manages the Wallet.
 */

import {
  call,
  Effect,
  put,
  takeLatest,
  take,
  select,
  fork
} from "redux-saga/effects";

import { WalletAPI } from "../api/wallet/wallet-api";
import {
  FETCH_CARDS_REQUEST,
  FETCH_TRANSACTIONS_REQUEST,
  START_PAYMENT,
  COMPLETE_PAYMENT,
  PAYMENT_INSERT_DATA_MANUALLY,
  PAYMENT_SHOW_SUMMARY,
  PAYMENT_PICK_PAYMENT_METHOD,
  PAYMENT_CONFIRM_PAYMENT_METHOD,
  PAYMENT_CONFIRM_SUMMARY
} from "../store/actions/constants";
import { cardsFetched } from "../store/actions/wallet/cards";
import { transactionsFetched } from "../store/actions/wallet/transactions";
import { CreditCard, CreditCardId } from "../types/CreditCard";
import { WalletTransaction } from "../types/wallet";
import ROUTES from "../navigation/routes";
import { NavigationActions } from "react-navigation";
import { PaymentRequestsGetResponse } from "../../definitions/pagopa-proxy/PaymentRequestsGetResponse";
import { ImportoEuroCents } from "../../definitions/pagopa-proxy/ImportoEuroCents";
import { CodiceContestoPagamento } from "../../definitions/pagopa-proxy/CodiceContestoPagamento";
import { Iban } from "../../definitions/pagopa-proxy/Iban";
import { EnteBeneficiario } from "../../definitions/pagopa-proxy/EnteBeneficiario";
import {
  storeRptIdData,
  storeVerificaResponse,
  storeInitialAmount,
  pickPaymentMethod,
  confirmPaymentMethod,
  storeSelectedPaymentMethod
} from "../store/actions/wallet/payment";
import { RptId, AmountInEuroCents } from "italia-ts-commons/lib/pagopa";
import { getFavoriteCreditCardId } from "../store/reducers/wallet/cards";
import { Option } from "../../node_modules/fp-ts/lib/Option";
import { Action } from "../store/actions/types";

function* fetchTransactions(
  loadTransactions: () => Promise<ReadonlyArray<WalletTransaction>>
): Iterator<Effect> {
  const transactions: ReadonlyArray<WalletTransaction> = yield call(
    loadTransactions
  );
  yield put(transactionsFetched(transactions));
}

function* fetchCreditCards(
  loadCards: () => Promise<ReadonlyArray<CreditCard>>
): Iterator<Effect> {
  const cards: ReadonlyArray<CreditCard> = yield call(loadCards);
  yield put(cardsFetched(cards));
}

const navigateTo = (route: string) => {
  return NavigationActions.navigate({ routeName: route });
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
      COMPLETE_PAYMENT
    ]);
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
    // either the QR code has been read, or the
    // data has been entered manually. Store the
    // payload and proceed with showing the
    // transaction information fetched from the
    // pagoPA proxy

    const {
      rptId,
      initialAmount
    }: { rptId: RptId; initialAmount: AmountInEuroCents } = action.payload;
    // TODO: validate data ("PAGOPA|002|...")
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
    const favoriteCard: Option<CreditCardId> = yield select(
      getFavoriteCreditCardId
    );
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
    FETCH_CARDS_REQUEST,
    fetchCreditCards,
    WalletAPI.getCreditCards
  );
  yield takeLatest(START_PAYMENT, paymentSaga);
}
