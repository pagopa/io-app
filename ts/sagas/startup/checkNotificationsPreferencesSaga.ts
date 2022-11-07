import { CommonActions } from "@react-navigation/native";
import { call, take } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { InitializedProfile } from "../../../definitions/backend/InitializedProfile";
import { remindersOptInEnabled } from "../../config";
import NavigationService from "../../navigation/NavigationService";
import ROUTES from "../../navigation/routes";
import { profileUpsert } from "../../store/actions/profile";
import { isProfileFirstOnBoarding } from "../../store/reducers/profile";
import { checkNotificationsPermissionsSaga } from "./checkNotificationsPermissionsSaga";

export function* checkNotificationsPreferencesSaga(
  userProfile: InitializedProfile
) {
  if (!remindersOptInEnabled) {
    // the feature flag is disabled
    return;
  }

  const isFirstOnboarding = isProfileFirstOnBoarding(userProfile);

  if (
    userProfile.reminder_status !== undefined &&
    userProfile.push_notifications_content_type !== undefined
  ) {
    // user has already set a preference
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

    if (
      action.payload.newValue.reminder_status !== undefined &&
      action.payload.newValue.push_notifications_content_type !== undefined
    ) {
      break;
    }
  }

  // check if the user has given system notification permissions
  yield* call(checkNotificationsPermissionsSaga);
}
