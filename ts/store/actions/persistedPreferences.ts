/**
 * Action types and action creator related to persisted preferences
 */
import { Calendar } from "react-native-calendar-events";
import { ActionType, createStandardAction } from "typesafe-actions";
import { Locales } from "../../../locales/locales";
import { ColorModeChoice } from "../../hooks/useAppThemeConfiguration";

export type TypefaceChoice = "comfortable" | "standard";

// These different locales only apply to the app labels
export type AppLocale = "it" | "en" | "de";

export const preferenceFingerprintIsEnabledSaveSuccess = createStandardAction(
  "PREFERENCES_FINGERPRINT_SAVE_SUCCESS"
)<{ isFingerprintEnabled: boolean }>();

export const preferredCalendarSaveSuccess = createStandardAction(
  "PREFERENCES_CALENDAR_SAVE_SUCCESS"
)<{ preferredCalendar: Calendar }>();

export const preferredCalendarRemoveSuccess = createStandardAction(
  "PREFERENCES_CALENDAR_REMOVE_SUCCESS"
)();

export const preferredLanguageSaveSuccess = createStandardAction(
  "PREFERENCES_LANGUAGE_SAVE_SUCCESS"
)<{ preferredLanguage: Locales }>();

export const serviceAlertDisplayedOnceSuccess = createStandardAction(
  "SERVICE_ALERT_DISPLAYED_ONCE_SUCCESS"
)<{ wasServiceAlertDisplayedOnce: boolean }>();

export const preferencesPagoPaTestEnvironmentSetEnabled = createStandardAction(
  "PREFERENCES_PAGOPA_TEST_ENVIRONMENT_SET_ENABLED"
)<{ isPagoPATestEnabled: boolean }>();

export const customEmailChannelSetEnabled = createStandardAction(
  "CUSTOM_EMAIL_CHANNEL_SET_ENABLED"
)<boolean>();

export const continueWithRootOrJailbreak = createStandardAction(
  "CONTINUE_WITH_ROOT_OR_JAILBREAK"
)<boolean>();

export const preferencesPnTestEnvironmentSetEnabled = createStandardAction(
  "PREFERENCES_PN_TEST_ENVIRONMENT_SET_ENABLED"
)<{ isPnTestEnabled: boolean }>();

export const preferencesIdPayTestSetEnabled = createStandardAction(
  "PREFERENCES_IDPAY_TEST_SET_ENABLED"
)<{ isIdPayTestEnabled: boolean }>();

export const preferencesExperimentalDesignEnabled = createStandardAction(
  "PREFERENCES_EXPERIMENTAL_DESIGN_ENABLED"
)<{ isExperimentalDesignEnabled: boolean }>();

export const preferencesFontSet = createStandardAction(
  "PREFERENCES_DESIGN_SYSTEM_SET_ENABLED"
)<TypefaceChoice>();

export const preferencesThemeSet = createStandardAction(
  "PREFERENCES_THEME_SET_ENABLED"
)<ColorModeChoice>();

export type PersistedPreferencesActions = ActionType<
  | typeof preferenceFingerprintIsEnabledSaveSuccess
  | typeof preferredCalendarSaveSuccess
  | typeof preferredCalendarRemoveSuccess
  | typeof preferredLanguageSaveSuccess
  | typeof serviceAlertDisplayedOnceSuccess
  | typeof preferencesPagoPaTestEnvironmentSetEnabled
  | typeof customEmailChannelSetEnabled
  | typeof continueWithRootOrJailbreak
  | typeof preferencesPnTestEnvironmentSetEnabled
  | typeof preferencesIdPayTestSetEnabled
  | typeof preferencesExperimentalDesignEnabled
  | typeof preferencesFontSet
  | typeof preferencesThemeSet
>;
