import * as pot from "@pagopa/ts-commons/lib/pot";
import { createSelector } from "reselect";
import { GlobalState } from "../../../../store/reducers/types";
import { isSuccessTransaction } from "../../../../types/pagopa";
import { walletPaymentUserWalletsSelector } from "../../payment/store/selectors";

export const walletTransactionHistorySelector = (state: GlobalState) =>
  state.wallet.transactions.transactions;
//
// THIS IS PURE LEGACY CODE, it is being put here as a placeholder for future logic
/**
 * to determine if a transaction is successfully completed we have to consider 2 cases
 * 1. payed /w CREDIT CARD: accountingStatus is not undefined AND accountingStatus === 1 || accountingStatus === 5 means the transaction has been
 * confirmed and the payment has been successfully completed
 * 2.payed /w other methods: accountingStatus is undefined AND id_status = 8 (Confermato mod1) or id_status = 9 (Confermato mod2)
 * ref: https://www.pivotaltracker.com/story/show/173850410
 */

/* "rendering truth table" for both pots goes as such
 *          SOME | NONE
 * LOADING    X  |  X
 * ERROR      X  |  O
 * -          X  |  O
 *
 * we need to make sure that only in O case we render the empty state
 */

export const isTransactionSuccess = isSuccessTransaction;

export const isAnySectionSomeOrLoadingSelector = createSelector(
  walletPaymentUserWalletsSelector,
  walletTransactionHistorySelector,
  (userWallets, transactions) => {
    const shouldRenderMethods =
      pot.isSome(userWallets) || pot.isLoading(userWallets);
    const shouldRenderHistory =
      pot.isSome(transactions) || pot.isLoading(transactions);
    return shouldRenderMethods || shouldRenderHistory;
  }
);
