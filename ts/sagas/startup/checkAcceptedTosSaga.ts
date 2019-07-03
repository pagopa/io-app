import { Effect } from "redux-saga";
import { put, take } from "redux-saga/effects";
import { UserProfileUnion } from "../../api/backend";
import { tosVersion } from "../../config";
import { navigateToTosScreen } from "../../store/actions/navigation";
import { tosAccepted } from "../../store/actions/onboarding";
import { profileUpsert } from "../../store/actions/profile";

export function* checkAcceptedTosSaga(
  userProfile: UserProfileUnion
): IterableIterator<Effect> {
  if (
    "accepted_tos_version" in userProfile &&
    userProfile.accepted_tos_version &&
    userProfile.accepted_tos_version >= tosVersion
  ) {
    return;
  }

  // Navigate to the TosScreen
  yield put(navigateToTosScreen);

  // Wait the user accept the ToS
  yield take(tosAccepted);

  /**
   * The user profile is updated storing the last accepted tos version.
   * If the user logs in for the first time, the accepted tos version is stored once the profile in initialized
   */
  if (userProfile.has_profile) {
    yield put(profileUpsert.request({ accepted_tos_version: tosVersion }));
  }
}
