import { ActionType, createAsyncAction } from "typesafe-actions";
import { BonusList } from "../../types/bonusList";

export const bonusListLoad = createAsyncAction(
  "BONUS_LIST_REQUEST",
  "BONUS_LIST_SUCCESS",
  "BONUS_LIST_FAILURE"
)<void, BonusList, Error>();

export type BonusActions = ActionType<typeof bonusListLoad>;
