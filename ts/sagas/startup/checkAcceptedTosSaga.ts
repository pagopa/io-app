import { call, put, take } from "typed-redux-saga/macro";
import { ActionType, getType } from "typesafe-actions";
import { StackActions } from "@react-navigation/native";
import { InitializedProfile } from "../../../definitions/backend/InitializedProfile";
import { tosVersion } from "../../config";
import { navigateToTosScreen } from "../../store/actions/navigation";
import { tosAccepted } from "../../store/actions/onboarding";
import { profileUpsert } from "../../store/actions/profile";
import { isProfileFirstOnBoarding } from "../../store/reducers/profile";
import { ReduxSagaEffect } from "../../types/utils";
import NavigationService from "../../navigation/NavigationService";

export function* checkAcceptedTosSaga(
  userProfile: InitializedProfile
): Generator<
  ReduxSagaEffect,
  void,
  | ActionType<typeof profileUpsert["success"]>
  | ActionType<typeof profileUpsert["failure"]>
> {
  // The user has to explicitly accept the new version of ToS if:
  // - this is the first access
  // - the user profile stores the user accepted an old version of ToS
  if (
    userProfile.accepted_tos_version !== undefined &&
    userProfile.accepted_tos_version >= tosVersion
  ) {
    return;
  }
  if (
    userProfile.accepted_tos_version === undefined ||
    isProfileFirstOnBoarding(userProfile) || // first onboarding
    !userProfile.has_profile || // profile is false
    (userProfile.accepted_tos_version !== undefined &&
      userProfile.accepted_tos_version < tosVersion) // accepted an older version of TOS
  ) {
    // Navigate to the TosScreen
    yield* call(navigateToTosScreen);
    // Wait the user accept the ToS
    yield* take(tosAccepted);
    yield* call(
      NavigationService.dispatchNavigationAction,
      StackActions.popToTop()
    );
    /**
     * The user profile is updated storing the last ToS version.
     * If the user logs in for the first time, the accepted tos version is stored once the profile in initialized
     */
    if (userProfile.has_profile) {
      yield* put(profileUpsert.request({ accepted_tos_version: tosVersion }));
      const action = yield* take<
        ActionType<typeof profileUpsert.success | typeof profileUpsert.failure>
      >([profileUpsert.success, profileUpsert.failure]);
      // call checkAcceptedTosSaga until we don't receive profileUpsert.success
      // tos acceptance must be saved in IO backend
      if (action.type === getType(profileUpsert.failure)) {
        yield* call(checkAcceptedTosSaga, userProfile);
      }
    }
  }
}
