import { Effect } from "redux-saga";
import { put, take } from "redux-saga/effects";
import { navigateToEmailInsertScreen } from "../../store/actions/navigation";
import { emailInsert } from "../../store/actions/onboarding";

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
  const emailExists: boolean = false;

  if (emailExists) {
    // Email exists
    // TODO: 168246944 implements this logic.
  } else {
    // No email is provided, user must insert the Email address.
    yield put(navigateToEmailInsertScreen);
    // Wait for the user to press "Continue" button after having checked out
    // theirs own email
    yield take(emailInsert);
  }
}
