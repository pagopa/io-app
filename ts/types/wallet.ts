export type PaymentMethod = {
  id: number;
  type: string;
};

export type WalletTransaction = {
  cardId: number;
  date: string;
  time: string;
  subject: string;
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
  subject: "UNKNOWN TRANSACTION",
  recipient: "",
  amount: 0,
  currency: "?",
  transactionCost: 0,
  isNew: false
};
