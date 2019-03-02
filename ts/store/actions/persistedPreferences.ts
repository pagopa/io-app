import { ActionType, createStandardAction } from "typesafe-actions";

export const preferenceFingerprintIsEnabledSave = createStandardAction(
  "PREFERENCES_FINGERPRINT_SAVE_SUCCESS"
)<boolean>();

export type PersistedPreferencesActions = ActionType<
  typeof preferenceFingerprintIsEnabledSave
>;
