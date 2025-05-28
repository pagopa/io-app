import { call, take } from "typed-redux-saga/macro";
import { CommonActions } from "@react-navigation/native";
import { InitializedProfile } from "../../../../definitions/backend/InitializedProfile";
import NavigationService from "../../../navigation/NavigationService";
import ROUTES from "../../../navigation/routes";
import { emailAcknowledged } from "../../onboarding/store/actions";
import {
  isProfileEmailValidated,
  isProfileFirstOnBoarding,
  hasProfileEmail
} from "../../settings/common/store/utils/guards";
import { ReduxSagaEffect } from "../../../types/utils";

/**
 * Launch email saga that consists of:
 * If user have an existing email:
 * - acknowledgement screen if the email address is validated (eg SPID login) and this if the first onboarding
 * - if the email address is not validated, promt a screen to inform and remember about validation
 * - if the user has not an email address (eg CIE login), a screen will be prompt to insert his own email address
 */
export function* checkAcknowledgedEmailSaga(
  userProfile: InitializedProfile
): IterableIterator<ReduxSagaEffect> {
  // Check if the profile has an email
  if (hasProfileEmail(userProfile)) {
    if (
      isProfileFirstOnBoarding(userProfile) &&
      !isProfileEmailValidated(userProfile)
    ) {
      // The user profile is just created (first onboarding), the conditional
      // view displays the screen to show the user's email used in app
      // OR
      // An email exists on the user's profile but it is not validated, the conditional
      // view shows a screen that forces the user to insert and validate his email
      yield* call(NavigationService.navigate, ROUTES.ONBOARDING, {
        screen: ROUTES.ONBOARDING_INSERT_EMAIL_SCREEN,
        params: { isOnboarding: true }
      });
    } else {
      // we can go on, no need to wait
      return;
    }
  } else {
    // the profile has no email address, user must insert it
    yield* call(NavigationService.navigate, ROUTES.ONBOARDING, {
      screen: ROUTES.ONBOARDING_INSERT_EMAIL_SCREEN,
      params: { isOnboarding: true }
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
}
