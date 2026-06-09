import { call, put, select, take } from "typed-redux-saga/macro";
import * as O from "fp-ts/lib/Option";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { CommonActions } from "@react-navigation/native";
import NavigationService from "../../../navigation/NavigationService";
import ROUTES from "../../../navigation/routes";
import { profileSelector } from "../../settings/common/store/selectors";
import {
  isProfileEmailValidated,
  isProfileEmailAlreadyTaken
} from "../../settings/common/store/utils/guards";
import { setEmailCheckAtStartupFailure } from "../../settings/common/store/actions";
import { emailAcknowledged } from "../../onboarding/store/actions";

export function* checkEmailSaga() {
  // We get the latest profile from the store
  const profile = yield* select(profileSelector);

  // When we use this saga, we are sure that the profile is not none
  if (pot.isSome(profile)) {
    // eslint-disable-next-line functional/no-let
    let userProfile = profile.value;
    if (!isProfileEmailValidated(userProfile)) {
      yield* put(setEmailCheckAtStartupFailure(O.some(true)));
      if (isProfileEmailAlreadyTaken(userProfile)) {
        yield* call(NavigationService.navigate, ROUTES.CHECK_EMAIL, {
          screen: ROUTES.CHECK_EMAIL_ALREADY_TAKEN,
          params: { email: userProfile.email ?? "" }
        });
      } else {
        yield* call(NavigationService.navigate, ROUTES.CHECK_EMAIL, {
          screen: ROUTES.CHECK_EMAIL_NOT_VERIFIED,
          params: { email: userProfile.email ?? "" }
        });
      }
      // Wait for the user to press "Continue" button after having checked out
      // his own email
      yield* take(emailAcknowledged);
      yield* call(
        NavigationService.dispatchNavigationAction,
        // We use navigate to go back to the main tab
        // https://reactnavigation.org/docs/nesting-navigators/#navigation-actions-are-handled-by-current-navigator-and-bubble-up-if-couldnt-be-handled
        CommonActions.navigate({
          name: ROUTES.MAIN,
          // If for some reason, we have navigation params
          // we want to merge them going back to the main tab.
          merge: true
        })
      );
      // We get the latest profile from the store and return it
      const maybeUpdatedProfile = yield* select(profileSelector);
      if (pot.isSome(maybeUpdatedProfile)) {
        userProfile = maybeUpdatedProfile.value;
      }
    }
    return userProfile;
  }
  return undefined;
}
