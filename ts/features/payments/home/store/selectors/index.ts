import * as pot from "@pagopa/ts-commons/lib/pot";
import _ from "lodash";
import { createSelector } from "reselect";
import { GlobalState } from "../../../../../store/reducers/types";
import { paymentsWalletUserMethodsSelector } from "../../../wallet/store/selectors";
import {
  walletLatestReceiptListPotSelector,
  walletReceiptListPotSelector
} from "../../../receipts/store/selectors";

export const isPaymentsSectionLoadingFirstTimeSelector = createSelector(
  paymentsWalletUserMethodsSelector,
  walletLatestReceiptListPotSelector,
  (methodsPot, latestTransactionsPot) =>
    (!pot.isSome(methodsPot) && pot.isLoading(methodsPot)) ||
    (!pot.isSome(latestTransactionsPot) && pot.isLoading(latestTransactionsPot))
);

export const isPaymentsSectionLoadingSelector = createSelector(
  paymentsWalletUserMethodsSelector,
  walletLatestReceiptListPotSelector,
  (methodsPot, latestTransactionsPot) =>
    pot.isLoading(methodsPot) || pot.isLoading(latestTransactionsPot)
);

const isPaymentsMethodsEmptySelector = createSelector(
  paymentsWalletUserMethodsSelector,
  userWallets =>
    pot.getOrElse(
      pot.map(userWallets, wallets => wallets.length === 0),
      false
    )
);

export const isPaymentsLatestTransactionsEmptySelector = createSelector(
  walletLatestReceiptListPotSelector,
  latestTransactionsPot =>
    pot.getOrElse(
      pot.map(latestTransactionsPot, transactions => transactions.length === 0),
      false
    )
);

export const isPaymentsTransactionsEmptySelector = createSelector(
  walletReceiptListPotSelector,
  transactionsPot =>
    pot.getOrElse(
      pot.map(transactionsPot, transactions => transactions.length === 0),
      false
    )
);

export const isPaymentsSectionEmptySelector = createSelector(
  isPaymentsMethodsEmptySelector,
  isPaymentsLatestTransactionsEmptySelector,
  (isMethodsEmpty, isTransactionsEmpty) => isMethodsEmpty && isTransactionsEmpty
);

export const isAddMethodsBannerVisibleSelector = (state: GlobalState) =>
  state.features.payments.home.shouldShowAddMethodsBanner;
