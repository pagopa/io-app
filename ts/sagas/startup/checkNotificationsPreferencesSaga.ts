import { take } from "typed-redux-saga/dist";
import { ActionType } from "typesafe-actions";
import { InitializedProfile } from "../../../definitions/backend/InitializedProfile";
import { profileUpsert } from "../../store/actions/profile";
import { isProfileFirstOnBoarding } from "../../store/reducers/profile";

export function* checkNotificationsPreferencesSaga(
  userProfile: InitializedProfile
) {
  const isFirstOnboarding = isProfileFirstOnBoarding(userProfile);

  if (userProfile.reminder_status !== undefined) {
    // user has already set a preference
    return;
  }

  // show the opt-in screen

  // wait for the notifications preferences to be set
  while (true) {
    const action = yield* take<ActionType<typeof profileUpsert.success>>(
      profileUpsert.success
    );

    if (action.payload.newValue.reminder_status !== undefined) {
      break;
    }
  }
}
