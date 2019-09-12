import { Effect } from "redux-saga";
import { put, take } from "redux-saga/effects";

import { navigateToEmailScreen } from "../../store/actions/navigation";
import { emailAcknowledged } from "../../store/actions/onboarding";
import { UserProfileUnion } from '../../api/backend';

/**
 * Launch email saga that consists of:
 * - acknowledgement screen if email already exists and is valid and the user
 *   does not want to change it 
 * - editing and validation screen, otherwise
 */
export function* checkAcknowledgedEmailSaga(
  userProfile: UserProfileUnion
): IterableIterator<Effect> {
  // Check if user profile has email
  if (userProfile.spid_email && userProfile.spid_email !== "") {
    // Email exists

    // Check if email is valid
    const isValid: boolean = true;

    if (isValid) {
      // If email exists and it's valid, navigate to the Email Screen in order
      // to wait for the user to check it out and press "Continue". Otherwise
      // a new email registration process is run
      yield put(navigateToEmailScreen());

      // Wait for the user to press "Continue" button after having checked out
      // theirs own email
      yield take(emailAcknowledged);
    }
  }
}
