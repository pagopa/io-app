/**
 * Action types and action creator related to persisted preferences
 */

import { Calendar } from "react-native-calendar-events";
import { ActionType, createStandardAction } from "typesafe-actions";

export const preferenceFingerprintIsEnabledSaveSuccess = createStandardAction(
  "PREFERENCES_FINGERPRINT_SAVE_SUCCESS"
)<{ isFingerprintEnabled: boolean }>();

export const preferredCalendarSaveSuccess = createStandardAction(
  "PREFERENCES_CALENDAR_SAVE_SUCCESS"
)<{ preferredCalendar: Calendar }>();

export const serviceAlertDisplayedOnceSuccess = createStandardAction(
  "SERVICE_ALERT_DISPLAYED_ONCE_SUCCESS"
)<{ wasServiceAlertDisplayedOnce: boolean }>();

export const pagoPaQAEnvironmentEnabledSuccess = createStandardAction(
  "PAGOPA_ENV_AS_QA"
)<{ isPagoPAQAEnabled: boolean }>();

export type PersistedPreferencesActions = ActionType<
  | typeof preferenceFingerprintIsEnabledSaveSuccess
  | typeof preferredCalendarSaveSuccess
  | typeof serviceAlertDisplayedOnceSuccess
  | typeof pagoPaQAEnvironmentEnabledSuccess // tslint:disable-line:max-union-size
>;
