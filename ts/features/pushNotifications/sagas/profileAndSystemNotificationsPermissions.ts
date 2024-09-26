import { CommonActions, StackActions } from "@react-navigation/native";
import { call, select, take } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { InitializedProfile } from "../../../../definitions/backend/InitializedProfile";
import NavigationService from "../../../navigation/NavigationService";
import ROUTES from "../../../navigation/routes";
import { profileUpsert } from "../../../store/actions/profile";
import { isProfileFirstOnBoarding } from "../../../store/reducers/profile";
import { requestNotificationPermissions } from "../utils";
import {
  trackNotificationsOptInPreviewStatus,
  trackNotificationsOptInReminderStatus
} from "../analytics";
import { updateMixpanelSuperProperties } from "../../../mixpanelConfig/superProperties";
import { GlobalState } from "../../../store/reducers/types";
import { updateMixpanelProfileProperties } from "../../../mixpanelConfig/profileProperties";
import { notificationsInfoScreenConsent } from "../store/actions/profileNotificationPermissions";
import {
  checkAndUpdateNotificationPermissionsIfNeeded,
  updateNotificationPermissionsIfNeeded
} from "./common";

export function* profileAndSystemNotificationsPermissions(
  userProfile: InitializedProfile
) {
  const profileMissedPushSettings =
    !userProfile.reminder_status ||
    !userProfile.push_notifications_content_type;
  if (profileMissedPushSettings) {
    // Show the opt-in screen (this properties are not related to the system
    // permission to receive notifications)
    const isFirstOnboarding = isProfileFirstOnBoarding(userProfile);
    yield* call(
      NavigationService.dispatchNavigationAction,
      CommonActions.navigate(ROUTES.ONBOARDING, {
        screen: ROUTES.ONBOARDING_NOTIFICATIONS_PREFERENCES,
        params: { isFirstOnboarding }
      })
    );

    // wait for the notifications preferences to be set
    while (true) {
      const action = yield* take<ActionType<typeof profileUpsert.success>>(
        profileUpsert.success
      );

      const contentType =
        action.payload.newValue.push_notifications_content_type;
      const reminderStatus = action.payload.newValue.reminder_status;
      if (reminderStatus !== undefined && contentType !== undefined) {
        yield* call(trackNotificationsOptInPreviewStatus, contentType);
        yield* call(trackNotificationsOptInReminderStatus, reminderStatus);
        break;
      }
    }
  }

  // Check if the user has given system notification permissions
  // and update the in-memory redux value if needed
  const hasNotificationPermission = yield* call(
    checkAndUpdateNotificationPermissionsIfNeeded
  );

  if (!hasNotificationPermission) {
    // Ask the user for notification permission and update
    // the in-memory redux value if needed
    const userHasGivenNotificationPermission = yield* call(
      requestNotificationPermissions
    );
    yield* call(
      updateNotificationPermissionsIfNeeded,
      userHasGivenNotificationPermission
    );

    if (!userHasGivenNotificationPermission && profileMissedPushSettings) {
      // Show how to enable notification permission from the settings
      // Be aware that this is modal on top of the OptIn-Screen and
      // it will never be shown if the user has not been through it
      yield* call(
        NavigationService.dispatchNavigationAction,
        CommonActions.navigate(ROUTES.ONBOARDING, {
          screen: ROUTES.ONBOARDING_NOTIFICATIONS_INFO_SCREEN_CONSENT
        })
      );

      yield* take(notificationsInfoScreenConsent);

      // Make sure to dismiss the modal
      yield* call(
        NavigationService.dispatchNavigationAction,
        StackActions.pop()
      );
    }
  }

  // Update mixpanel super and profile properties
  // (mainly for the notification permission)
  const state = (yield* select()) as GlobalState;
  yield* call(updateMixpanelSuperProperties, state);
  yield* call(updateMixpanelProfileProperties, state);

  if (profileMissedPushSettings) {
    yield* call(
      NavigationService.dispatchNavigationAction,
      StackActions.popToTop()
    );
  }
}
