import { ActionType, createStandardAction } from "typesafe-actions";

import { AuthLevel } from "../../../../common/utils";
import { CieEnv } from "../../utils";

export const setCieEnv = createStandardAction("CIE_SET_ENV")<CieEnv>();

export const cieIDDisableTourGuide = createStandardAction(
  "CIE_ID_DISABLE_TOUR_GUIDE"
)();
export const cieIDSetSelectedSecurityLevel = createStandardAction(
  "CIE_ID_SET_SELECTED_SECURITY_LEVEL"
)<AuthLevel>();

export type CieLoginConfigActions =
  | ActionType<typeof cieIDDisableTourGuide>
  | ActionType<typeof cieIDSetSelectedSecurityLevel>
  | ActionType<typeof setCieEnv>;
