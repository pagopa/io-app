import _, { values } from "lodash";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { createSelector } from "reselect";
import { IndexedById } from "../../../../../store/helpers/indexer";
import { isSuccessTransaction, Transaction } from "../../../../../types/pagopa";

import { GlobalState } from "../../../../../store/reducers/types";

/**
 * The transactions selector will truncate the list at this length
 */
const MAX_TRANSACTIONS_IN_LIST = 500;

export type TransactionsState = Readonly<{
  transactions: pot.Pot<IndexedById<Transaction>, Error>;
  total: pot.Pot<number, Error>;
}>;

const walletTransactionSelector = (state: GlobalState) =>
  state.features.payments.legacyTransaction;

export const walletTransactionDetailsPotSelector = (state: GlobalState) =>
  walletTransactionSelector(state).details;

const potTransactions = (state: GlobalState) =>
  state.features.payments.legacyTransaction.transactions;

// selectors
export const getTransactions = createSelector(
  potTransactions,
  transactionsPot =>
    pot.map(
      transactionsPot,
      txs =>
        values(txs).filter(value =>
          isSuccessTransaction(value)
        ) as ReadonlyArray<Transaction>
    )
);

export const latestTransactionsSelector = createSelector(
  getTransactions,
  transactionsPot =>
    pot.map(
      transactionsPot,
      transactions =>
        [...transactions]
          .sort((a, b) =>
            // FIXME: code here is checking for NaN assuming creation dates may
            //        be undefined, but since we override the pagoPA Wallet
            //        type to force creation dates to always be defined and we
            //        use that new type for parsing responses, we ignore
            //        wallets with undefined creation dates... so the check
            //        is unnecessary.

            isNaN(a.created as any) || isNaN(b.created as any)
              ? -1 // define behavior for undefined creation dates (pagoPA allows these to be undefined)
              : b.created.toISOString().localeCompare(a.created.toISOString())
          )
          .filter(t => t.statusMessage !== "rifiutato")
          .slice(0, MAX_TRANSACTIONS_IN_LIST) // WIP no magic numbers
    )
);

// return true if there are more transactions to load
export const areMoreTransactionsAvailable = (state: GlobalState): boolean =>
  pot.getOrElse(
    pot.map(
      state.features.payments.legacyTransaction.transactions,
      transactions =>
        pot.getOrElse(
          pot.map(
            state.features.payments.legacyTransaction.total,
            t =>
              Object.keys(transactions).length <
              Math.min(t, MAX_TRANSACTIONS_IN_LIST)
          ),
          false
        )
    ),
    false
  );

// return the number of transactions loaded
// note transactions loaded should be different (in cardinality) from ones displayed since we operate
// a filter over them (see latestTransactionsSelector)
export const getTransactionsLoadedLength = (state: GlobalState) =>
  pot.getOrElse(
    pot.map(
      state.features.payments.legacyTransaction.transactions,
      txs => Object.keys(txs).length
    ),
    0
  );

export const isPaymentsLegacyTransactionsEmptySelector = createSelector(
  latestTransactionsSelector,
  transactionsPot =>
    pot.getOrElse(
      pot.map(
        transactionsPot,
        transactions => _.values(transactions).length === 0
      ),
      false
    )
);
