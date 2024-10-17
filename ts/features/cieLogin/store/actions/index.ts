import { ActionType, createStandardAction } from "typesafe-actions";

export const cieLoginEnableUat = createStandardAction("CIE_LOGIN_ENABLE_UAT")();

export const cieLoginDisableUat = createStandardAction(
  "CIE_LOGIN_DISABLE_UAT"
)();

export const cieIDFeatureSetEnabled = createStandardAction(
  "PREFERENCES_CIE_ID_FEATURE_SET_ENABLED"
)<{ isCieIDFeatureEnabled: boolean }>();

export type CieLoginConfigActions =
  | ActionType<typeof cieLoginDisableUat>
  | ActionType<typeof cieLoginEnableUat>
  | ActionType<typeof cieIDFeatureSetEnabled>;
