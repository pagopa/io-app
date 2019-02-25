import { ActionType, createStandardAction } from "typesafe-actions";

export const preferencesLanguagesLoadSuccess = createStandardAction(
  "PREFERENCES_LANGUAGES_LOAD_SUCCESS"
)<ReadonlyArray<string>>();

export const preferenceFingerprintIsEnabledSave = createStandardAction(
  "PREFERENCES_FINGERPRINT_SAVE_SUCCESS"
)<boolean>();

export type PreferencesActions = ActionType<
  | typeof preferenceFingerprintIsEnabledSave
  | typeof preferencesLanguagesLoadSuccess
>;
