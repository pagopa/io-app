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
  id: -1,
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
