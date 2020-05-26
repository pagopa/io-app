import { ActionType, createAsyncAction } from "typesafe-actions";
import { BonusList } from "../../types/bonusList";

export const availableBonusListLoad = createAsyncAction(
  "BONUS_AVAILABLE_LIST_REQUEST",
  "BONUS_AVAILABLE_SUCCESS",
  "BONUS_AVAILABLE_FAILURE"
)<void, BonusList, Error>();

export type BonusActions = ActionType<typeof availableBonusListLoad>;
