/**
 * A saga that manages the Wallet.
 */

import { call, Effect, fork, put, take } from "redux-saga/effects";

import { ApiFetchResult, isApiFetchFailure } from "../api";
import { fetchCreditCards, fetchTransactions } from "../api/pagopa";
import {
  FETCH_CARDS_REQUEST,
  FETCH_TRANSACTIONS_REQUEST
} from "../store/actions/constants";
import { cardsFetched } from "../store/actions/wallet/cards";
import {
  fetchTransactionsRequest,
  transactionsFetched
} from "../store/actions/wallet/transactions";
import { CreditCard } from "../types/CreditCard";
import { WalletTransaction } from "../types/wallet";

function* fetchTransactionsSaga(token: string): Iterator<Effect> {
  const response: ApiFetchResult<ReadonlyArray<WalletTransaction>> = yield call(
    fetchTransactions,
    token
  );
  if (isApiFetchFailure(response)) {
    console.warn(response.error.message);
  } else {
    yield put(transactionsFetched(response.result));
  }
}

function* fetchCreditCardsSaga(token: string): Iterator<Effect> {
  const response: ApiFetchResult<ReadonlyArray<CreditCard>> = yield call(
    fetchCreditCards,
    token
  );
  if (isApiFetchFailure(response)) {
    console.warn(response.error.message);
  } else {
    yield put(cardsFetched(response.result));
    yield put(fetchTransactionsRequest());
  }
}

function* watcher(): Iterator<Effect> {
  while (true) {
    const action = yield take([
      FETCH_TRANSACTIONS_REQUEST,
      FETCH_CARDS_REQUEST
    ]);
    const token = "TOKEN"; // get this from state (wallet_token)
    if (action.type === FETCH_CARDS_REQUEST) {
      yield fork(fetchCreditCardsSaga, token);
    }
    if (action.type === FETCH_TRANSACTIONS_REQUEST) {
      yield fork(fetchTransactionsSaga, token);
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
  yield fork(watcher);
}
