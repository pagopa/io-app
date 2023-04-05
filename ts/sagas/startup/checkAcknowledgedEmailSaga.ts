import { call, take } from "typed-redux-saga/macro";
import { InitializedProfile } from "../../../definitions/backend/InitializedProfile";
import NavigationService from "../../navigation/NavigationService";
import ROUTES from "../../navigation/routes";
import { emailAcknowledged } from "../../store/actions/onboarding";
import {
  hasProfileEmail,
  isProfileEmailValidated,
  isProfileFirstOnBoarding
} from "../../store/reducers/profile";
import { ReduxSagaEffect } from "../../types/utils";

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
      isProfileFirstOnBoarding(userProfile) ||
      !isProfileEmailValidated(userProfile)
    ) {
      // The user profile is just created (first onboarding), the conditional
      // view displays the screen to show the user's email used in app
      // OR
      // An email exists on the user's profile but it is not validated, the conditional
      // view shows the component that reminds to validate the email address or allows the navigation to edit it.
      yield* call(NavigationService.navigate, ROUTES.ONBOARDING, {
        screen: ROUTES.ONBOARDING_READ_EMAIL_SCREEN
      });
    } else {
      // we can go on, no need to wait
      return;
    }
  } else {
    // the profile has no email address, user must insert it
    // EmailInsertScreen knows if the user comes from onboarding or not
    // if he comes from onboarding, on email inserted the navigation will focus EmailReadScreen to remember the user
    // to validate it
    yield* call(NavigationService.navigate, ROUTES.ONBOARDING, {
      screen: ROUTES.ONBOARDING_INSERT_EMAIL_SCREEN
    });
  }

  // Wait for the user to press "Continue" button after having checked out
  // his own email
  yield* take(emailAcknowledged);
}
