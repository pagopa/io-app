export type PaymentMethod = {
  id: number;
  type: string;
};

export type CreditCard = {
  id: number;
  brand: string;
  lastUsage: string;
  number: string;
  image: any; // eslint-disable-line flowtype/no-weak-types
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

export const UNKNOWN_CARD: CreditCard = {
  id: -1,
  brand: "Unknows",
  lastUsage: "???",
  number: "0",
  image: null
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
