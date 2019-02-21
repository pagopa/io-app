import { ActionType, createStandardAction } from "typesafe-actions";

export const preferencesLanguagesLoadSuccess = createStandardAction(
  "PREFERENCES_LANGUAGES_LOAD_SUCCESS"
)<ReadonlyArray<string>>();

// export const getPreferenceFingerprintMaybeEnabled = createStandardAction(
//   "PREFERENCES_FINGERPRINT_LOAD_SUCCESS"
// )();

export const setPreferenceFingerprintMaybeEnabledSuccess = createStandardAction(
  "PREFERENCES_FINGERPRINT_SAVE_SUCCESS"
)<boolean>();

export type PreferencesActions = ActionType<
  typeof setPreferenceFingerprintMaybeEnabledSuccess 
  // | typeof getPreferenceFingerprintMaybeEnabled 
  | typeof preferencesLanguagesLoadSuccess
>;
