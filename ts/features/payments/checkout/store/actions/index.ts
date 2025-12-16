import { PaymentsCheckoutNetworkingActions } from "./networking";
import { PaymentsCheckoutOrchestrationActions } from "./orchestration";

export type PaymentsCheckoutActions =
  | PaymentsCheckoutNetworkingActions
  | PaymentsCheckoutOrchestrationActions;
