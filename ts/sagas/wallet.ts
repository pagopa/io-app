/**
 * A saga that manages the Wallet.
 */

import { call, Effect, put, takeLatest, take } from "redux-saga/effects";

import { WalletAPI } from "../api/wallet/wallet-api";
import {
  FETCH_CARDS_REQUEST,
  FETCH_TRANSACTIONS_REQUEST,
  START_PAYMENT,
  COMPLETE_PAYMENT,
  PAYMENT_INSERT_DATA_MANUALLY,
  PAYMENT_SHOW_SUMMARY,
  PAYMENT_PICK_PAYMENT_METHOD,
  PAYMENT_CONFIRM_PAYMENT_METHOD
} from "../store/actions/constants";
import { cardsFetched } from "../store/actions/wallet/cards";
import { transactionsFetched } from "../store/actions/wallet/transactions";
import { CreditCard } from "../types/CreditCard";
import { WalletTransaction } from "../types/wallet";
import ROUTES from "../navigation/routes";
import { NavigationActions } from "react-navigation";
import { PaymentRequestsGetResponse } from "../../definitions/pagopa-proxy/PaymentRequestsGetResponse";
import { ImportoEuroCents } from "../../definitions/pagopa-proxy/ImportoEuroCents";
import { CodiceContestoPagamento } from "../../definitions/pagopa-proxy/CodiceContestoPagamento";
import { Iban } from "../../definitions/pagopa-proxy/Iban";
import { EnteBeneficiario } from "../../definitions/pagopa-proxy/EnteBeneficiario";

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
  while (true) {
    const action = yield take([
      PAYMENT_INSERT_DATA_MANUALLY,
      PAYMENT_SHOW_SUMMARY,
      PAYMENT_PICK_PAYMENT_METHOD,
      PAYMENT_CONFIRM_PAYMENT_METHOD,
      COMPLETE_PAYMENT
    ]);

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

      const qrcodeData = action.payload;
      // TODO: validate data ("PAGOPA|002|...")

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
    FETCH_CARDS_REQUEST,
    fetchCreditCards,
    WalletAPI.getCreditCards
  );
  yield takeLatest(START_PAYMENT, paymentSaga);
}
