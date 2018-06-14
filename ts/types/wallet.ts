/**
 * Definition of other types required
 * by the app
 */
// TODO: these types may need to be aligned with the PagoPA ones
// @https://www.pivotaltracker.com/story/show/157769657
// TODO: evaluate a remodulation of the types related to the transactions
// TODO: verify if email, phone numbers etc can became responsive

/**
 * This type represents the transaction as reported in the notice sent to the user;
 * it contains the data used by the app to identify the transation the user wants to perform
 */
export type NotifiedTransaction = {
  noticeCode: string;
  notifiedAmount: number;
  currentAmount: number; // also in WalletTransaction
  expireDate: Date;
  tranche: string;
  paymentReason: string; // also in WalletTransaction
  cbill: string;
  iuv: string;
};

export type TransactionEntity = {
  code: string;
  name: string;
  address: string;
  city: string;
  tel: string;
  webpage: string;
  email: string;
  pec: string;
};

export type TransactionSubject = {
  name: string;
  address: string;
};

/**
 * This type represents a transaction (or payment)
 * carried out by the user; it contains the information
 * needed for UI-related purposes
 */
export type WalletTransaction = {
  cardId: number;
  date: string;
  time: string;
  paymentReason: string;
  recipient: string;
  amount: number;
  currency: string;
  transactionCost: number;
  isNew: boolean;
};

export const UNKNOWN_TRANSACTION: WalletTransaction = {
  cardId: -1,
  date: "",
  time: "",
  paymentReason: "UNKNOWN TRANSACTION",
  recipient: "",
  amount: 0,
  currency: "?",
  transactionCost: 0,
  isNew: false
};
