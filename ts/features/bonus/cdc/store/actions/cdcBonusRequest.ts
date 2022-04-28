import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { CdcBonusRequestList } from "../../types/CdcBonusRequest";
import { NetworkError } from "../../../../../utils/errors";

/**
 * The user selects for which year would ask the bonus
 */
export const cdcSelectedBonus =
  createStandardAction("CDC_SELECTED_BONUS")<CdcBonusRequestList>();

/**
 * get and handle the list of the bonus
 */
export const cdcRequestBonusList = createAsyncAction(
  "CDC_REQUEST_BONUS_LIST_REQUEST",
  "CDC_REQUEST_BONUS_LIST_SUCCESS",
  "CDC_REQUEST_BONUS_LIST_FAILURE"
)<void, CdcBonusRequestList, NetworkError>();

/**
 * Enroll the user for the years in which he has requested the bonus
 */
export const cdcEnrollUserToBonus = createAsyncAction(
  "CDC_ENROLL_REQUEST",
  "CDC_ENROLL_SUCCESS",
  "CDC_ENROLL_FAILURE"
)<void, CdcBonusRequestList, NetworkError>();

export type CdcBonusRequestActions =
  | ActionType<typeof cdcSelectedBonus>
  | ActionType<typeof cdcRequestBonusList>
  | ActionType<typeof cdcEnrollUserToBonus>;
