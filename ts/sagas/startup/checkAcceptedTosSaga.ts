import { Effect } from "redux-saga";
import { put, take } from "redux-saga/effects";
import { InitializedProfile } from "../../../definitions/backend/InitializedProfile";
import { tosVersion } from "../../config";
import { navigateToTosScreen } from "../../store/actions/navigation";
import { tosAccepted } from "../../store/actions/onboarding";
import { profileUpsert } from "../../store/actions/profile";

export function* checkAcceptedTosSaga(
  userProfile: InitializedProfile
): IterableIterator<Effect> {
  // The user has to explicitly accept the new version of ToS if:
  // - this is the first access
  // - the user profile stores the user accepted an old version of ToS
  if (
    "accepted_tos_version" in userProfile &&
    userProfile.accepted_tos_version &&
    userProfile.accepted_tos_version >= tosVersion
  ) {
    return;
  }

  if (
    !userProfile.has_profile ||
    (userProfile.has_profile && "accepted_tos_version" in userProfile)
  ) {
    // Navigate to the TosScreen
    yield put(navigateToTosScreen);

    // Wait the user accept the ToS
    yield take(tosAccepted);
  }

  /**
   * The user profile is updated storing the last ToS version.
   * If the user logs in for the first time, the accepted tos version is stored once the profile in initialized
   */
  if (userProfile.has_profile) {
    yield put(profileUpsert.request({ accepted_tos_version: tosVersion }));
  }
}
