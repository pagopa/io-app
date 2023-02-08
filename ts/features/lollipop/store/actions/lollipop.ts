/**
 * Action types and action creator related to lollipop
 */

import { ActionType, createStandardAction } from "typesafe-actions";

export const lollipopKeyTagSave = createStandardAction(
  "LOLLIPOP_KEY_TAG_SAVE"
)<{ keyTag: string }>();

export type LollipopActions = ActionType<typeof lollipopKeyTagSave>;
