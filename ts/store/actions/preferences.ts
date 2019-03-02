import { ActionType, createStandardAction } from "typesafe-actions";

export const preferencesLanguagesLoadSuccess = createStandardAction(
  "PREFERENCES_LANGUAGES_LOAD_SUCCESS"
)<ReadonlyArray<string>>();

export type PreferencesActions = ActionType<
  typeof preferencesLanguagesLoadSuccess
>;
