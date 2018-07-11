import { CardsActions } from "./cards";
import { PaymentAction } from "./payment";
import { TransactionsActions } from "./transactions";

export type WalletActions = CardsActions | TransactionsActions | PaymentAction;
