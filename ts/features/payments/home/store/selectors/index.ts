import * as pot from "@pagopa/ts-commons/lib/pot";
import _ from "lodash";
import { createSelector } from "reselect";
import { GlobalState } from "../../../../../store/reducers/types";
import { latestTransactionsSelector } from "../../../../../store/reducers/wallet/transactions";
import { walletPaymentUserWalletsSelector } from "../../../checkout/store/selectors";

export const isPaymentsSectionLoadingSelector = createSelector(
  walletPaymentUserWalletsSelector,
  latestTransactionsSelector,
  (methodsPot, transactionsPot) =>
    pot.isLoading(methodsPot) || pot.isLoading(transactionsPot)
);

export const isPaymentsMethodsEmptySelector = createSelector(
  walletPaymentUserWalletsSelector,
  userWallets => pot.isSome(userWallets) && userWallets.value.length === 0
);

export const isPaymentsTransactionsEmptySelector = createSelector(
  latestTransactionsSelector,
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
