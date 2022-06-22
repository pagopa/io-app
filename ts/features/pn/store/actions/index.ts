import { ActionType, createStandardAction } from "typesafe-actions";

/**
 * Set whether to show a warning message when opening a PN message.
 * The preference will be persisted.
 */
export const pnPreferencesSetWarningForMessageOpening = createStandardAction(
  "PN_PREFERENCES_SET_WARNING_FOR_MESSAGE_OPENING"
)<boolean>();

export type PnActions = ActionType<
  typeof pnPreferencesSetWarningForMessageOpening
>;
