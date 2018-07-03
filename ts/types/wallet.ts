import { ImageSource } from "react-native-vector-icons/Icon";
import { CreditCardId } from "./CreditCard";

/**
 * Definition of other types required
 * by the app
 * TODO:
 *  - these types may need to be aligned with the PagoPA ones
 *      @https://www.pivotaltracker.com/story/show/157769657
 *  -  verify if email, phone numbers etc can became responsive
 *      @https://www.pivotaltracker.com/n/projects/2048617/stories/158330111
 */

/** This type represents the transaction as reported in the notice sent to the user; it contains the data
 *  used by the app to identify the transation the user wants to perform.
 */
export type NotifiedTransaction = Readonly<{
  noticeCode: string;
  notifiedAmount: number;
  currentAmount: number; // also in WalletTransaction
  expireDate: Date;
  tranche: string;
  paymentReason: string; // also in WalletTransaction
  cbill: string;
  iuv: string;
}>;

export type TransactionEntity = Readonly<{
  code: string;
  name: string;
  address: string;
  city: string;
  tel: string;
  webpage: string;
  email: string;
  pec: string;
}>;

export type TransactionSubject = Readonly<{
  name: string;
  address: string;
}>;

/**
 * This type represents a transaction (or payment)
 * carried out by the user; it contains the information
 * needed for UI-related purposes
 */
export type WalletTransaction = {
  id: number;
  cardId: CreditCardId;
  isoDatetime: string;
  date: string; // it could be the same of date, having date as date.toLocaleDateString() TODO: @https://www.pivotaltracker.com/n/projects/2048617/stories/157769657
  time: string; // it could be the same of date, having date as date.toLocaleTimeString() TODO: @https://www.pivotaltracker.com/n/projects/2048617/stories/157769657
  paymentReason: string;
  recipient: string;
  amount: number;
  currency: string;
  transactionCost: number;
  isNew: boolean;
};

export const UNKNOWN_TRANSACTION: WalletTransaction = {
  id: -1,
  cardId: -1 as CreditCardId,
  isoDatetime: "",
  date: "",
  time: "",
  paymentReason: "UNKNOWN TRANSACTION",
  recipient: "",
  amount: 0,
  currency: "?",
  transactionCost: 0,
  isNew: false
};

/**
 * This type represents a transaction Manager. One manager should be associated to each payment method not handled by PagoPA
 */
export type TransactionManager = Readonly<{
  id: number;
  maxFee: number;
  icon: ImageSource;
}>;

/**
 * This type represent the details of a transaction the user should display
 * to see summary of the transaction.
 */
export type TransactionSummary = Readonly<{
  currentAmount: number;
  fee: number;
  totalAmount: number; // it should be obtained as sum of the "currrentAmount" and the "fee"
  paymentReason: string;
  entityName: string;
}>;
