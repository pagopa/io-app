/**
 * A saga that manages the Wallet.
 */

import { call, Effect, put, take, fork, select, all } from "redux-saga/effects";

import {
  FETCH_CARDS_REQUEST,
  FETCH_TRANSACTIONS_REQUEST
} from "../store/actions/constants";
import { cardsFetched } from "../store/actions/wallet/cards";
import {
  transactionsFetched,
  fetchTransactionsRequest
} from "../store/actions/wallet/transactions";
import { CreditCard } from "../types/CreditCard";
import { WalletTransaction } from "../types/wallet";
import { fetchCreditCards, fetchTransactionsByCreditCard } from "../api/pagopa";
import { ApiFetchResult, isApiFetchFailure } from "../api";
import { creditCardIdsSelector } from "../store/reducers/wallet/cards";

function* fetchTransactions(token: string): Iterator<Effect> {
  const cardIds: ReadonlyArray<number> = yield select(creditCardIdsSelector);

  const responses: ReadonlyArray<
    ApiFetchResult<ReadonlyArray<WalletTransaction>>
  > = yield all(
    cardIds.map(cardId => call(fetchTransactionsByCreditCard, token, cardId))
  );

  const transactions = responses.reduce(
    (t: ReadonlyArray<WalletTransaction>, r) => [
      ...t,
      ...(isApiFetchFailure(r) ? [] : r.result)
    ],
    []
  );

  yield put(transactionsFetched(transactions));
}

function* fetchCreditCardsSaga(token: string): Iterator<Effect> {
  const response: ApiFetchResult<ReadonlyArray<CreditCard>> = yield call(
    fetchCreditCards,
    token
  );
  if (isApiFetchFailure(response)) {
    console.error(response.error);
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
    const token =
      "O1vN7EE5I67FhF20484CpGC9m1Qso7A9viu3FVGzVggDO2xyyhiDGzRhciZv74sy";
    if (action.type === FETCH_CARDS_REQUEST) {
      yield fork(fetchCreditCardsSaga, token);
    }
    if (action.type === FETCH_TRANSACTIONS_REQUEST) {
      yield fork(fetchTransactions, token);
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
