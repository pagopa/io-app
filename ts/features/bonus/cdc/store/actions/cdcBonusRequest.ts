import { createStandardAction } from "typesafe-actions";
import { CdcBonusRequestList } from "../../types/CdcBonusRequest";

/**
 * The user selects for which year would ask the bonus
 */
export const cdcSelectedBonus =
  createStandardAction("CDC_SELECTED_BONUS")<CdcBonusRequestList>();
