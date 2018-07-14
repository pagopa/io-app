import { PaymentAction } from "./payment";
import { TransactionsActions } from "./transactions";
import { WalletsActions } from "./wallets";

export type WalletActions =
  | WalletsActions
  | TransactionsActions
  | PaymentAction;
