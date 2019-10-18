import { Effect } from "redux-saga";
import { put, take } from "redux-saga/effects";
import {
  navigateToEmailInsertScreen,
  navigateToEmailReadScreen
} from "../../store/actions/navigation";
import { emailAcknowledged, emailInsert } from "../../store/actions/onboarding";

/**
 * Launch email saga that consists of:
 * If user have an existing email:
 * - acknowledgement screen if email already exists and it is valid and the user
 *   does not want to change it
 * - editing and validation screen, otherwise
 *
 * If user doesn't have an email, an add email screen is provided
 */
export function* checkAcknowledgedEmailSaga(): IterableIterator<Effect> {
  // Check if user profile has email
  // TODO: put email existence check here
  // To test #168246944 set emailExists = true;
  // To test #168247020 set emailExists = false;
  const emailExists: boolean = true;

  if (emailExists) {
    // Email exists

    // Check if email is valid
    // TODO: put email validation API query here
    // To test #168246944 set isValid = true;
    const isValid: boolean = true;

    if (isValid) {
      // If email exists and it's valid, navigate to the Email Screen in order
      // to wait for the user to check it out and press "Continue". Otherwise
      // a new email registration process will be run
      yield put(navigateToEmailReadScreen());

      // Wait until user checks his email and he presses "Continue" button
      // after having checked out theirs own email
      yield take(emailAcknowledged);
    }
  } else {
    // No email is provided, user must insert the Email address.
    yield put(navigateToEmailInsertScreen);
    // Wait for the user to press "Continue" button after having checked out
    // theirs own email
    yield take(emailInsert);
  }
}
