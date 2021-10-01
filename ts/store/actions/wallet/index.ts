import { PaymentActions } from "./payment";
import { TransactionsActions } from "./transactions";
import { WalletsActions } from "./wallets";
import { DeleteActions } from "./delete";

export type WalletActions =
  | WalletsActions
  | TransactionsActions
  | PaymentActions
  | DeleteActions;
