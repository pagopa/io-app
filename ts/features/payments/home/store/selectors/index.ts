import * as pot from "@pagopa/ts-commons/lib/pot";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import _ from "lodash";
import { createSelector } from "reselect";
import { GlobalState } from "../../../../../store/reducers/types";
import { Transaction } from "../../../../../types/pagopa";
import { walletPaymentUserWalletsSelector } from "../../../checkout/store/selectors";

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

export const isPaymentsSectionLoadingSelector = createSelector(
  walletPaymentUserWalletsSelector,
  selectPaymentsTransactions,
  (methodsPot, transactionsPot) =>
    pot.isLoading(methodsPot) || pot.isLoading(transactionsPot)
);

export const isPaymentsMethodsEmptySelector = createSelector(
  walletPaymentUserWalletsSelector,
  userWallets => pot.isSome(userWallets) && userWallets.value.length === 0
);

export const isPaymentsTransactionsEmptySelector = createSelector(
  selectPaymentsTransactions,
  transactionsPot =>
    pot.isSome(transactionsPot) && _.values(transactionsPot.value).length === 0
);

export const isPaymentsSectionEmptySelector = createSelector(
  isPaymentsMethodsEmptySelector,
  isPaymentsTransactionsEmptySelector,
  (isMethodsEmpty, isTransactionsEmpty) => isMethodsEmpty && isTransactionsEmpty
);

export const isAddMethodsBannerVisibleSelector = (state: GlobalState) =>
  state.features.payments.home.shouldShowAddMethodsBanner;
