import { ActionType, createStandardAction } from "typesafe-actions";

export const setSecurityAdviceAcknowledged = createStandardAction(
  "SET_SECURITY_ADVICE_ACKNOWLEDGED"
)<boolean>();

export const setSecurityAdviceReadyToShow = createStandardAction(
  "SET_SECURITY_ADVICE_READY_TO_SHOW"
)<boolean>();

export type SecurityAdviceActions =
  | ActionType<typeof setSecurityAdviceAcknowledged>
  | ActionType<typeof setSecurityAdviceReadyToShow>;
