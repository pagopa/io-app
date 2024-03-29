import { PaymentsPaymentNetworkingActions } from "./networking";
import { PaymentsPaymentOrchestrationActions } from "./orchestration";

export type PaymentsPaymentActions =
  | PaymentsPaymentNetworkingActions
  | PaymentsPaymentOrchestrationActions;
