/**
 * Action types and action creator related to lollipop
 */

import { ActionType, createStandardAction } from "typesafe-actions";
import { GlobalState } from "../reducers/types";

export const lollipopKeyTagSave = createStandardAction(
  "LOLLIPOP_KEY_TAG_SAVE"
)<{ keyTag: string }>();

export const lollipopSelector = (state: GlobalState) => state.lollipop;

export type LollipopActions = ActionType<typeof lollipopKeyTagSave>;
