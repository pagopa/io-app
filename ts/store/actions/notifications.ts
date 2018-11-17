/**
 * Action types and action creator related to the Notifications.
 */

import { NonEmptyString } from "italia-ts-commons/lib/strings";
import {
  ActionType,
  createAction,
  createStandardAction
} from "typesafe-actions";

export const updateNotificationsInstallationToken = createStandardAction(
  "NOTIFICATIONS_INSTALLATION_TOKEN_UPDATE"
)<string>();

export const updateNotificationInstallationFailure = createStandardAction(
  "NOTIFICATIONS_INSTALLATION_UPDATE_FAILURE"
)();

export const updateNotificationsPendingMessage = createAction(
  "NOTIFICATIONS_PENDING_MESSAGE_UPDATE",
  resolve => (messageId: NonEmptyString, foreground: boolean) =>
    resolve({ id: messageId, foreground })
);

export const clearNotificationPendingMessage = createStandardAction(
  "NOTIFICATIONS_PENDING_MESSAGE_CLEAR"
)();

export const localNotificationRequest = createStandardAction(
  "NOTIFICATIONS_LOCAL_REQUEST"
)<string>();

export type NotificationsActions =
  | ActionType<typeof updateNotificationsInstallationToken>
  | ActionType<typeof updateNotificationInstallationFailure>
  | ActionType<typeof updateNotificationsPendingMessage>
  | ActionType<typeof clearNotificationPendingMessage>
  | ActionType<typeof localNotificationRequest>;
