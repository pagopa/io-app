import { Effect } from "redux-saga";
import { put, take } from "redux-saga/effects";
import { UserProfileUnion } from "../../api/backend";
import { navigateToEmailInsertScreen } from "../../store/actions/navigation";
import { emailInsert } from "../../store/actions/onboarding";

/**
 * Launch email saga that consists of:
 * If user have an existing email:
 * - acknowledgement screen if email already exists and is valid and the user
 *   does not want to change it
 * - editing and validation screen, otherwise
 *
 * If user doesn't have an email must specify a valid email.s
 */
export function* checkAcknowledgedEmailSaga(
  userProfile: UserProfileUnion
): IterableIterator<Effect> {
  // Check if user profile has email
  if (userProfile.spid_email && userProfile.spid_email !== "") {
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
