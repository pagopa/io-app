/**
 * Action types and action creator related to persisted preferences
 */
import { Calendar } from "react-native-calendar-events";
import { ActionType, createStandardAction } from "typesafe-actions";
import { Locales } from "../../../locales/locales";

export const preferenceFingerprintIsEnabledSaveSuccess = createStandardAction(
  "PREFERENCES_FINGERPRINT_SAVE_SUCCESS"
)<{ isFingerprintEnabled: boolean }>();

export const preferredCalendarSaveSuccess = createStandardAction(
  "PREFERENCES_CALENDAR_SAVE_SUCCESS"
)<{ preferredCalendar: Calendar }>();

export const preferredLanguageSaveSuccess = createStandardAction(
  "PREFERENCES_LANGUAGE_SAVE_SUCCESS"
)<{ preferredLanguage: Locales }>();

export const serviceAlertDisplayedOnceSuccess = createStandardAction(
  "SERVICE_ALERT_DISPLAYED_ONCE_SUCCESS"
)<{ wasServiceAlertDisplayedOnce: boolean }>();

export const preferencesPagoPaTestEnvironmentSetEnabled = createStandardAction(
  "PREFERENCES_PAGOPA_TEST_ENVIRONMENT_SET_ENABLED"
)<{ isPagoPATestEnabled: boolean }>();

export const preferencesExperimentalFeaturesSetEnabled = createStandardAction(
  "PREFERENCES_EXPERIMENTAL_FEATURES_SET_ENABLED"
)<boolean>();

export const customEmailChannelSetEnabled = createStandardAction(
  "CUSTOM_EMAIL_CHANNEL_SET_ENABLED"
)<boolean>();

export type PersistedPreferencesActions = ActionType<
  // tslint:disable-next-line: max-union-size
  | typeof preferenceFingerprintIsEnabledSaveSuccess
  | typeof preferredCalendarSaveSuccess
  | typeof preferredLanguageSaveSuccess
  | typeof serviceAlertDisplayedOnceSuccess
  | typeof preferencesPagoPaTestEnvironmentSetEnabled
  | typeof preferencesExperimentalFeaturesSetEnabled
  | typeof customEmailChannelSetEnabled
>;
