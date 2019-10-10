import { Effect } from "redux-saga";
import { put, take } from "redux-saga/effects";

import { navigateToEmailScreen } from "../../store/actions/navigation";
import { emailAcknowledged } from "../../store/actions/onboarding";

/**
 * Launch email saga that consists of:
 * - acknowledgement screen if email already exists and it is valid and the user
 *   does not want to change it
 * - editing and validation screen, otherwise
 */
export function* checkAcknowledgedEmailSaga(): IterableIterator<Effect> {
  // Check if user profile has email
  // TODO: put email existence check here
  const emailExists: boolean = true;

  if (emailExists) {
    // Email exists

    // Check if email is valid
    // TODO: put email validation API query here
    const isValid: boolean = true;

    if (isValid) {
      // If email exists and it's valid, navigate to the Email Screen in order
      // to wait for the user to check it out and press "Continue". Otherwise
      // a new email registration process will be run
      yield put(navigateToEmailScreen());

      // Wait until user checks his email and he presses "Continue" button
      // after having checked out theirs own email
      yield take(emailAcknowledged);
    }
  }
}
