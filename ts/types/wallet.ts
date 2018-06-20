/**
 * Definition of other types required
 * by the app
 */
// TODO: these types may need to be aligned with the PagoPA ones
// @https://www.pivotaltracker.com/story/show/157769657

/**
 * This type represents a transaction (or payment)
 * carried out by the user; it contains the information
 * needed for UI-related purposes
 */
export type WalletTransaction = {
  id: number;
  cardId: number;
  isoDatetime: string;
  date: string; // it could be the same of date, having date as date.toLocaleDateString() TODO: @https://www.pivotaltracker.com/n/projects/2048617/stories/157769657
  time: string; // it could be the same of date, having date as date.toLocaleTimeString() TODO: @https://www.pivotaltracker.com/n/projects/2048617/stories/157769657
  paymentReason: string;
  recipient: string;
  amount: number;
  currency: string;
  transactionCost: number; // it should be amount + transactionCost TODO: @https://www.pivotaltracker.com/n/projects/2048617/stories/157769657
  isNew: boolean;
  isTransactionCompleted: boolean; // it will be true when the user accepted to proceed with a transaction and he is going to display the datail of the transaction as receipt
};

export const UNKNOWN_TRANSACTION: WalletTransaction = {
  id: -1,
  cardId: -1,
  isoDatetime: "",
  date: "",
  time: "",
  paymentReason: "UNKNOWN TRANSACTION",
  recipient: "",
  amount: 0,
  currency: "?",
  transactionCost: 0,
  isNew: false,
  isTransactionCompleted: false
};
