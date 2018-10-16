/**
 * Reducers, states, selectors and guards for the transactions
 */

import { values } from "lodash";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";

import { Transaction } from "../../../types/pagopa";
import * as pot from "../../../types/pot";
import { cleanPaymentDescription } from "../../../utils/cleanPaymentDescription";
import { Action } from "../../actions/types";
import {
  fetchTransactionsFailure,
  fetchTransactionsRequest,
  fetchTransactionsSuccess
} from "../../actions/wallet/transactions";
import { IndexedById, toIndexed } from "../../helpers/indexer";
import { GlobalState } from "../types";

export type TransactionsState = Readonly<{
  transactions: pot.Pot<IndexedById<Transaction>>;
}>;

const TRANSACTIONS_INITIAL_STATE: TransactionsState = {
  transactions: pot.none
};

// selectors
export const getTransactions = (state: GlobalState) =>
  pot.map(
    state.wallet.transactions.transactions,
    txs =>
      values(txs).filter(_ => _ !== undefined) as ReadonlyArray<Transaction>
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
              //        be undefined, but since we override the pagopa Wallet
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
          .slice(0, 50) // WIP no magic numbers
    )
);

const cleanDescription = ({ description, ...transaction }: Transaction) => {
  const cleanedDescription = cleanPaymentDescription(description);

  return { ...transaction, description: cleanedDescription };
};

// reducer
const reducer = (
  state: TransactionsState = TRANSACTIONS_INITIAL_STATE,
  action: Action
): TransactionsState => {
  switch (action.type) {
    case getType(fetchTransactionsRequest):
      return {
        ...state,
        transactions: pot.toLoading(state.transactions)
      };

    case getType(fetchTransactionsSuccess):
      return {
        ...state,
        transactions: pot.some(
          toIndexed(action.payload.map(cleanDescription), _ => _.id)
        )
      };

    case getType(fetchTransactionsFailure):
      return {
        ...state,
        transactions: pot.toError(state.transactions, action.payload)
      };

    default:
      return state;
  }
};

export default reducer;
