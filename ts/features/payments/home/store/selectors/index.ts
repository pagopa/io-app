import * as pot from "@pagopa/ts-commons/lib/pot";
import _ from "lodash";
import { createSelector } from "reselect";
import { GlobalState } from "../../../../../store/reducers/types";
import { latestTransactionsSelector } from "../../../../../store/reducers/wallet/transactions";
import { paymentsWalletUserMethodsSelector } from "../../../wallet/store/selectors";

export const isPaymentsSectionLoadingSelector = createSelector(
  paymentsWalletUserMethodsSelector,
  latestTransactionsSelector,
  (methodsPot, transactionsPot) =>
    pot.isLoading(methodsPot) || pot.isLoading(transactionsPot)
);

export const isPaymentsMethodsEmptySelector = createSelector(
  paymentsWalletUserMethodsSelector,
  userWallets =>
    pot.getOrElse(
      pot.map(userWallets, wallets => wallets.length === 0),
      false
    )
);

export const isPaymentsTransactionsEmptySelector = createSelector(
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

export const isPaymentsSectionEmptySelector = createSelector(
  isPaymentsMethodsEmptySelector,
  isPaymentsTransactionsEmptySelector,
  (isMethodsEmpty, isTransactionsEmpty) => isMethodsEmpty && isTransactionsEmpty
);

export const isAddMethodsBannerVisibleSelector = (state: GlobalState) =>
  state.features.payments.home.shouldShowAddMethodsBanner;
