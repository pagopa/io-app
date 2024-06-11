import { ActionType, createStandardAction } from "typesafe-actions";

export const cieLoginEnableUat = createStandardAction("CIE_LOGIN_ENABLE_UAT")();

export const cieLoginDisableUat = createStandardAction(
  "CIE_LOGIN_DISABLE_UAT"
)();

export type CieLoginConfigActions =
  | ActionType<typeof cieLoginDisableUat>
  | ActionType<typeof cieLoginEnableUat>;
