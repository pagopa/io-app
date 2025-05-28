import { ActionType, createStandardAction } from "typesafe-actions";
import { SpidLevel } from "../../utils";

export const cieLoginEnableUat = createStandardAction("CIE_LOGIN_ENABLE_UAT")();

export const cieLoginDisableUat = createStandardAction(
  "CIE_LOGIN_DISABLE_UAT"
)();

export const cieIDDisableTourGuide = createStandardAction(
  "CIE_ID_DISABLE_TOUR_GUIDE"
)();
export const cieIDSetSelectedSecurityLevel = createStandardAction(
  "CIE_ID_SET_SELECTED_SECURITY_LEVEL"
)<SpidLevel>();

export type CieLoginConfigActions =
  | ActionType<typeof cieLoginDisableUat>
  | ActionType<typeof cieLoginEnableUat>
  | ActionType<typeof cieIDDisableTourGuide>
  | ActionType<typeof cieIDSetSelectedSecurityLevel>;
