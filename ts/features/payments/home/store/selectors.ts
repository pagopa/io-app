import { GlobalState } from "../../../../store/reducers/types";
import { isSuccessTransaction } from "../../../../types/pagopa";

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
export const isTransactionSuccess = isSuccessTransaction;
