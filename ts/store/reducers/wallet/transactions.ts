/**
 * Reducers, states, selectors and guards for the transactions
 */
import * as pot from "italia-ts-commons/lib/pot";
import { values } from "lodash";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";

import { isSuccessTransaction, Transaction } from "../../../types/pagopa";
import { Action } from "../../actions/types";
import {
  fetchTransactionsFailure,
  fetchTransactionsRequest,
  fetchTransactionsSuccess
} from "../../actions/wallet/transactions";
import { IndexedById, toIndexed } from "../../helpers/indexer";
import { GlobalState } from "../types";

/**
 * The transactions selector will truncate the list at this length
 */
const MAX_TRANSACTIONS_IN_LIST = 50;

export type TransactionsState = Readonly<{
  transactions: pot.Pot<IndexedById<Transaction>, Error>;
  total: pot.Pot<number, Error>;
}>;

const TRANSACTIONS_INITIAL_STATE: TransactionsState = {
  transactions: pot.none,
  total: pot.none
};

// selectors
export const getTransactions = (state: GlobalState) =>
  pot.map(
    state.wallet.transactions.transactions,
    txs =>
      values(txs).filter(
        _ => _ !== undefined && isSuccessTransaction(_)
      ) as ReadonlyArray<Transaction>
  );

export const getWalletTransactionsCreator = (idWallet: number) => (
  state: GlobalState
) =>
  pot.map(getTransactions(state), tsx =>
    tsx.filter(_ => _.idWallet === idWallet)
  );

export const latestTransactionsSelector = createSelector(
  getTransactions,
  potTransactions =>
    pot.map(
      potTransactions,
      transactions =>
        [...transactions]
          .sort(
            (a, b) =>
              // FIXME: code here is checking for NaN assuming creation dates may
              //        be undefined, but since we override the pagoPA Wallet
              //        type to force creation dates to always be defined and we
              //        use that new type for parsing responses, we ignore
              //        wallets with undefined creation dates... so the check
              //        is unnecessary.
              // tslint:disable-next-line:no-useless-cast
              isNaN(a.created as any) || isNaN(b.created as any)
                ? -1 // define behavior for undefined creation dates (pagoPA allows these to be undefined)
                : b.created.toISOString().localeCompare(a.created.toISOString())
          )
          .filter(t => t.statusMessage !== "rifiutato")
          .slice(0, MAX_TRANSACTIONS_IN_LIST) // WIP no magic numbers
    )
);

// return true if there are more transactions to load
export const areMoreTransactionsAvailable = (state: GlobalState): boolean => {
  return pot.getOrElse(
    pot.map(state.wallet.transactions.transactions, transactions => {
      return pot.getOrElse(
        pot.map(
          state.wallet.transactions.total,
          t => Object.keys(transactions).length < t
        ),
        false
      );
    }),
    false
  );
};

// return the number of transactions loaded
// note transactions loaded should be different (in cardinality) from ones displayed since we operate
// a filter over them (see latestTransactionsSelector)
export const getTransactionsLoadedLength = (state: GlobalState) =>
  pot.getOrElse(
    pot.map(
      state.wallet.transactions.transactions,
      txs => Object.keys(txs).length
    ),
    0
  );

// reducer
const reducer = (
  state: TransactionsState = TRANSACTIONS_INITIAL_STATE,
  action: Action
): TransactionsState => {
  switch (action.type) {
    case getType(fetchTransactionsRequest):
      return {
        ...state,
        transactions: pot.toLoading(state.transactions),
        total: pot.toLoading(state.total)
      };

    case getType(fetchTransactionsSuccess):
      const prevTransactions = pot.getOrElse<IndexedById<Transaction>>(
        state.transactions,
        {}
      );
      const total = {
        ...prevTransactions,
        ...toIndexed(action.payload.data, _ => _.id)
      };
      return {
        ...state,
        transactions: pot.some(total),
        total: pot.some(action.payload.total.fold(0, s => s))
      };

    case getType(fetchTransactionsFailure):
      return {
        ...state,
        transactions: pot.toError(state.transactions, action.payload),
        total: pot.toError(state.total, action.payload)
      };

    default:
      return state;
  }
};

export default reducer;
