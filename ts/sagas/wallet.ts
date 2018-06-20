/**
 * A saga that manages the Wallet.
 */

import { call, Effect, put, takeLatest } from "redux-saga/effects";

import { WalletAPI } from "../api/wallet/wallet-api";
import {
  FETCH_CARDS_REQUEST,
  FETCH_TRANSACTIONS_REQUEST
} from "../store/actions/constants";
import { cardsFetched } from "../store/actions/wallet/cards";
import { transactionsFetched } from "../store/actions/wallet/transactions";
import { CreditCard } from "../types/CreditCard";
import { WalletTransaction } from "../types/wallet";
import { fetchCreditCards } from "../api/pagopa";
import { ApiFetchResult } from "../api";
import { Wallet } from "../../definitions/pagopa/Wallet";

function* fetchTransactions(
  loadTransactions: () => Promise<ReadonlyArray<WalletTransaction>>
): Iterator<Effect> {
  const transactions: ReadonlyArray<WalletTransaction> = yield call(
    loadTransactions
  );
  yield put(transactionsFetched(transactions));
}

function* fetchCreditCardsSaga(
  loadCards: (token: string) => Promise<ApiFetchResult<Readonly<Wallet>>>,
  token: string
): Iterator<Effect> {
  const cards: ReadonlyArray<CreditCard> = yield call(loadCards, token);
  yield put(cardsFetched(cards));
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
    fetchCreditCardsSaga,
    fetchCreditCards,
    "6JgPz41xViiG9AWOTcpnkjtELu5YTOSxx1hR6WoMWQRpS5YzB6eL8Gp0CAtcFkm9"
  );
}
