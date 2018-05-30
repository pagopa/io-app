/**
 * A saga that manages the Profile.
 */

import { call, Effect, put, takeLatest } from "redux-saga/effects";

import { WalletAPI } from "../api/wallet/wallet-api";
import { LOAD_TRANSACTIONS_REQUEST } from "../store/actions/constants";
import { transactionsLoaded } from "../store/actions/wallet";
import { WalletTransaction } from "../types/wallet";

function* loadTransactions(): Iterator<Effect> {
  const transactions: ReadonlyArray<WalletTransaction> = yield call(
    WalletAPI.getAllTransactions
  );
  yield put(transactionsLoaded(transactions));
}

// This function listens for Profile related requests and calls the needed saga.
export default function* root(): Iterator<Effect> {
  yield takeLatest(LOAD_TRANSACTIONS_REQUEST, loadTransactions);
}
