import { ActionType, createStandardAction } from "typesafe-actions";

import { AuthLevel } from "../../../../common/utils";

export const cieLoginEnableUat = createStandardAction("CIE_LOGIN_ENABLE_UAT")();

export const cieLoginDisableUat = createStandardAction(
  "CIE_LOGIN_DISABLE_UAT"
)();

export const cieIDDisableTourGuide = createStandardAction(
  "CIE_ID_DISABLE_TOUR_GUIDE"
)();
export const cieIDSetSelectedSecurityLevel = createStandardAction(
  "CIE_ID_SET_SELECTED_SECURITY_LEVEL"
)<AuthLevel>();

export type CieLoginConfigActions =
  | ActionType<typeof cieIDDisableTourGuide>
  | ActionType<typeof cieIDSetSelectedSecurityLevel>
  | ActionType<typeof cieLoginDisableUat>
  | ActionType<typeof cieLoginEnableUat>;
