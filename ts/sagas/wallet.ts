/**
 * A saga that manages the Profile.
 */

import { call, Effect, put, takeLatest } from "redux-saga/effects";

import { WalletAPI } from "../api/wallet/wallet-api";
import { FETCH_TRANSACTIONS_REQUEST, FETCH_CARDS_REQUEST } from "../store/actions/constants";
import { transactionsFetched } from "../store/actions/wallet/transactions";
import { WalletTransaction } from "../types/wallet";
import { CreditCard } from '../types/CreditCard';
import { cardsFetched } from '../store/actions/wallet/cards';

function* fetchTransactions(): Iterator<Effect> {
  const transactions: ReadonlyArray<WalletTransaction> = yield call(
    WalletAPI.getAllTransactions
  );
  yield put(transactionsFetched(transactions));
}

function *fetchCards(): Iterator<Effect> {
  const cards: ReadonlyArray<CreditCard> = yield call(
    WalletAPI.getCreditCards
  );
  yield put(cardsFetched(cards));
}

// This function listens for Profile related requests and calls the needed saga.
export default function* root(): Iterator<Effect> {
  yield takeLatest(FETCH_TRANSACTIONS_REQUEST, fetchTransactions);
  yield takeLatest(FETCH_CARDS_REQUEST, fetchCards);
}
