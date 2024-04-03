import * as pot from "@pagopa/ts-commons/lib/pot";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import _ from "lodash";
import { createSelector } from "reselect";
import { GlobalState } from "../../../../../store/reducers/types";
import { Transaction } from "../../../../../types/pagopa";

export const selectPaymentsTransactions = (state: GlobalState) =>
  state.wallet.transactions.transactions;

export const selectPaymentsTransactionSorted = createSelector(
  selectPaymentsTransactions,
  transactionsPot =>
    pipe(
      pot.toOption(transactionsPot),
      O.map(indexedTransactions => _.values(indexedTransactions)),
      O.map(A.filter((t): t is Transaction => t !== undefined)),
      O.map(transactions =>
        _.orderBy(transactions, item => item?.created, ["desc"])
      ),
      O.getOrElse(() => [] as ReadonlyArray<Transaction>)
    )
);
