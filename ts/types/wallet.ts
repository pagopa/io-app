export type PaymentMethod = {
  id: number;
  type: string;
};

export type Operation = {
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

export const UNKNOWN_OPERATION: Operation = {
  cardId: -1,
  date: "",
  time: "",
  subject: "UNKNOWN OPERATION",
  recipient: "",
  amount: 0,
  currency: "?",
  transactionCost: 0,
  isNew: false
};
