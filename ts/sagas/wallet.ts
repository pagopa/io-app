/**
 * A saga that manages the Wallet.
 */

import { call, Effect, put, take, fork, select } from "redux-saga/effects";

import { WalletAPI } from "../api/wallet/wallet-api";
import {
  FETCH_CARDS_REQUEST,
  FETCH_TRANSACTIONS_REQUEST,
  ADD_CARD_REQUEST
} from "../store/actions/constants";
import { cardsFetched } from "../store/actions/wallet/cards";
import { transactionsFetched } from "../store/actions/wallet/transactions";
import { CreditCard } from "../types/CreditCard";
import { WalletTransaction } from "../types/wallet";
import { getNewCardData } from "../store/reducers/wallet/cards";
import { Option } from "fp-ts/lib/Option";
import { addCard } from "../api/pagopa";

function* fetchTransactions(_: string): Iterator<Effect> {
  const transactions: ReadonlyArray<WalletTransaction> = yield call(
    WalletAPI.getTransactions
  );
  yield put(transactionsFetched(transactions));
}

function* fetchCreditCards(_: string): Iterator<Effect> {
  const cards: ReadonlyArray<CreditCard> = yield call(WalletAPI.getCreditCards);
  yield put(cardsFetched(cards));
}

function* addCardSaga(token: string): Iterator<Effect> {
  const card: Option<CreditCard> = yield select(getNewCardData);
  if (card.isNone()) {
    console.warn("Can't find newly entered card");
  } else {
    // call pagopa api to add card
    const success: boolean = yield call(addCard, token, card.value);
    if (!success) {
      console.warn("Failed to add card!");
    }
  }
}

function* watcher(): Iterator<Effect> {
  while (true) {
    const action = yield take([
      FETCH_TRANSACTIONS_REQUEST,
      FETCH_CARDS_REQUEST,
      ADD_CARD_REQUEST
    ]);
    const token = "TOKEN"; // get this from state (wallet_token)
    if (action.type === FETCH_CARDS_REQUEST) {
      yield fork(fetchCreditCards, token);
    }
    if (action.type === FETCH_TRANSACTIONS_REQUEST) {
      yield fork(fetchTransactions, token);
    }
    if (action.type === ADD_CARD_REQUEST) {
      yield fork(addCardSaga, token);
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
