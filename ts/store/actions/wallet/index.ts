import { CardsActions } from "./cards";
import { TransactionsActions } from "./transactions";
import { PaymentAction } from "./payment";

export type WalletActions = CardsActions | TransactionsActions | PaymentAction;
