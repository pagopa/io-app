import { PagoPaActions } from "./pagopa";
import { PaymentActions } from "./payment";
import { TransactionsActions } from "./transactions";
import { WalletsActions } from "./wallets";

export type WalletActions =
  | WalletsActions
  | TransactionsActions
  | PaymentActions
  | PagoPaActions;
