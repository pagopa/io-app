import { PaymentActions } from "./payment";
import { TransactionsActions } from "./transactions";
import { WalletsActions } from "./wallets";
import { PagoPaActions } from "./pagopa";

export type WalletActions =
  | WalletsActions
  | TransactionsActions
  | PaymentActions
  | PagoPaActions;
