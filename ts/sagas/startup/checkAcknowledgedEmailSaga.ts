import { Effect } from "redux-saga";
import { cancel, fork, put, take, takeEvery } from "redux-saga/effects";
import { getType } from "typesafe-actions";
import { UserProfile } from "../../../definitions/backend/UserProfile";
import {
  navigateToEmailInsertScreen,
  navigateToEmailReadScreen,
  navigateToEmailValidateScreen
} from "../../store/actions/navigation";
import { emailAcknowledged, emailInsert } from "../../store/actions/onboarding";
import {
  hasProfileEmail,
  isProfileEmailValidated,
  isProfileFirstOnBoarding
} from "../../store/reducers/profile";

/**
 * Launch email saga that consists of:
 * If user have an existing email:
 * - acknowledgement screen if the email is validate (eg SPID) and this if the first onboarding
 * - if the email is not validated promt a screen to inform and remember about validation
 * - if the user has not an email (eg CIE) a screen will be prompt to insert his own email addredd
 */
export function* checkAcknowledgedEmailSaga(
  userProfile: UserProfile
): IterableIterator<Effect> {
  // check if the profile has an email
  if (hasProfileEmail(userProfile)) {
    // If email exists but it is not validate we show a screen as a reminder to validate it or
    // where the user can edit the email added but not validated yet
    if (!isProfileEmailValidated(userProfile)) {
      yield put(navigateToEmailValidateScreen());
    }
    // if the user profile is just created (first onboarding) we show
    // the screen where user's email used in app is displayed
    else if (isProfileFirstOnBoarding(userProfile)) {
      yield put(navigateToEmailReadScreen());
    } else {
      return;
    }
  } else {
    // No email is provided, user must insert the Email address.
    yield put(navigateToEmailInsertScreen());
  }

  const watchEditEmailSagaTask = yield fork(watchEditEmailSaga);

  // Wait for the user to press "Continue" button after having checked out
  // theirs own email
  yield take(emailAcknowledged);

  yield cancel(watchEditEmailSagaTask);
}

export function* watchEditEmailSaga(): Iterator<Effect> {
  yield takeEvery([getType(emailInsert)], function*() {
    // Wait for the user to press "Continue" button after having inserted
    // theirs own email
    yield put(navigateToEmailValidateScreen());
  });
}
