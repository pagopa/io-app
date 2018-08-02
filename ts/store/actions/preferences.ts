import { PREFERENCES_LANGUAGES_LOAD_SUCCESS } from "./constants";

export type PreferencesLanguagesLoadSuccess = Readonly<{
  type: typeof PREFERENCES_LANGUAGES_LOAD_SUCCESS;
  payload: ReadonlyArray<string>;
}>;

export type PreferencesActions = PreferencesLanguagesLoadSuccess;

export const preferencesLanguagesLoadSuccess = (
  languages: ReadonlyArray<string>
): PreferencesLanguagesLoadSuccess => ({
  type: PREFERENCES_LANGUAGES_LOAD_SUCCESS,
  payload: languages
});
