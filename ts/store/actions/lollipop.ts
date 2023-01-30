/**
 * Action types and action creator related to lollipop
 */

import { ActionType, createStandardAction } from "typesafe-actions";

export const lollipopKeyTagSaveSuccess = createStandardAction(
  "LOLLIPOP_KEY_TAG_SAVE_SUCCESS"
)<{ keyTag: string }>();

export type LollipopActions = ActionType<typeof lollipopKeyTagSaveSuccess>;
