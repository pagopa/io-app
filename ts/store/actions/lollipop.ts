/**
 * Action types and action creator related to lollipop
 */

import { ActionType, createStandardAction } from "typesafe-actions";
import { GlobalState } from "../reducers/types";

export const lollipopKeyTagSaveSuccess = createStandardAction(
  "LOLLIPOP_KEY_TAG_SAVE_SUCCESS"
)<{ keyTag: string }>();

export const lollipopSelector = (state: GlobalState) => state.lollipop;

export type LollipopActions = ActionType<typeof lollipopKeyTagSaveSuccess>;
