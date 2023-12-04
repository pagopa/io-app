import { ActionType, createStandardAction } from "typesafe-actions";

export const setSecurityAdviceAcknowledged = createStandardAction(
  "SET_SECURITY_ADVICE_ACKNOWLEDGED"
)();

export type securityAdviceActions = ActionType<
  typeof setSecurityAdviceAcknowledged
>;
