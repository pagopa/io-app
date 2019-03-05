import { ActionType, createStandardAction } from "typesafe-actions";

export const preferenceFingerprintIsEnabledSaveSuccess = createStandardAction(
  "PREFERENCES_FINGERPRINT_SAVE_SUCCESS"
)<{ isFingerprintEnabled: boolean }>();

export type PersistedPreferencesActions = ActionType<
  typeof preferenceFingerprintIsEnabledSaveSuccess
>;
