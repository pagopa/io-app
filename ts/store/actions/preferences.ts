import { ActionType, createStandardAction } from "typesafe-actions";

export const preferencesLanguagesLoadSuccess = createStandardAction(
  "PREFERENCES_LANGUAGES_LOAD_SUCCESS"
)<ReadonlyArray<string>>();

export const setScreenReaderEnabled = createStandardAction(
  "PREFERENCES_SET_SCREEN_READER_ENABLED"
)<{ screenReaderEnabled: boolean }>();

export type PreferencesActions = ActionType<
  typeof preferencesLanguagesLoadSuccess | typeof setScreenReaderEnabled
>;
