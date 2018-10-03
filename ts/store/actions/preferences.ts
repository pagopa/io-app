import { ActionType, createAction } from "typesafe-actions";

export const preferencesLanguagesLoadSuccess = createAction(
  "PREFERENCES_LANGUAGES_LOAD_SUCCESS",
  resolve => (languages: ReadonlyArray<string>) => resolve(languages)
);

export type PreferencesActions = ActionType<
  typeof preferencesLanguagesLoadSuccess
>;
