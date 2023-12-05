import { ActionType, createStandardAction } from "typesafe-actions";
import { SecurityAdviceAcknowledgedState } from "../reducers/securityAdviceReducer";

export const setSecurityAdviceAcknowledged = createStandardAction(
  "SET_SECURITY_ADVICE_ACKNOWLEDGED"
)<SecurityAdviceAcknowledgedState>();

export type SecurityAdviceActions = ActionType<
  typeof setSecurityAdviceAcknowledged
>;
