import { WalletPaymentNetworkingActions } from "./networking";
import { WalletPaymentOrchestrationActions } from "./orchestration";

export type WalletPaymentActions =
  | WalletPaymentNetworkingActions
  | WalletPaymentOrchestrationActions;
