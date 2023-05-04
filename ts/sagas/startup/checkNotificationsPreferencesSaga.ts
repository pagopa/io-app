import { CommonActions, StackActions } from "@react-navigation/native";
import { call, take } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { InitializedProfile } from "../../../definitions/backend/InitializedProfile";
import { remindersOptInEnabled } from "../../config";
import NavigationService from "../../navigation/NavigationService";
import ROUTES from "../../navigation/routes";
import { profileUpsert } from "../../store/actions/profile";
import { isProfileFirstOnBoarding } from "../../store/reducers/profile";
import {
  trackNotificationsOptInPreviewStatus,
  trackNotificationsOptInReminderStatus
} from "../../utils/analytics";
import { requestNotificationPermissions } from "../../utils/notification";
import { checkNotificationsPermissionsSaga } from "./checkNotificationsPermissionsSaga";

export function* checkNotificationsPreferencesSaga(
  userProfile: InitializedProfile
) {
  if (!remindersOptInEnabled) {
    // the feature flag is disabled
    return;
  }

  const isFirstOnboarding = isProfileFirstOnBoarding(userProfile);

  // Check if the user has already set a preference for push notification opt-in
  if (
    userProfile.reminder_status !== undefined &&
    userProfile.push_notifications_content_type !== undefined
  ) {
    // Make sure to ask for push notification permissions. This call is needed
    // since an existing user that has already opted-in may be running the
    // application on a new device. To enable the push receival, the system
    // permission must be asked explicitly and this is the first entry point
    // where it makes sense to do so. On iOS, if the user denies the permission,
    // the popup dialog does not appear anymore (on following application
    // restarts).
    // TODO when upgrading Android target SDK to 33+, check that the system does
    // not show the dialog on following application restarts, if the user has
    // initially denied the permission
    yield* call(requestNotificationPermissions);

    return;
  }

  // show the opt-in screen
  yield* call(() =>
    NavigationService.dispatchNavigationAction(
      CommonActions.navigate(ROUTES.ONBOARDING, {
        screen: ROUTES.ONBOARDING_NOTIFICATIONS_PREFERENCES,
        params: { isFirstOnboarding }
      })
    )
  );

  // wait for the notifications preferences to be set
  while (true) {
    const action = yield* take<ActionType<typeof profileUpsert.success>>(
      profileUpsert.success
    );

    const contentType = action.payload.newValue.push_notifications_content_type;
    const reminderStatus = action.payload.newValue.reminder_status;
    if (reminderStatus !== undefined && contentType !== undefined) {
      trackNotificationsOptInPreviewStatus(contentType);
      trackNotificationsOptInReminderStatus(reminderStatus);
      break;
    }
  }

  yield* call(
    NavigationService.dispatchNavigationAction,
    StackActions.popToTop()
  );

  // check if the user has given system notification permissions
  yield* call(checkNotificationsPermissionsSaga);
}
