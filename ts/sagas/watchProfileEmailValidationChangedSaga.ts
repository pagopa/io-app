import { fromNullable, none, Option } from "fp-ts/lib/Option";
import { Effect, put, takeEvery } from "redux-saga/effects";
import { ActionType, getType } from "typesafe-actions";
import { profileLoadSuccess } from "../store/actions/profile";
import { profileEmailValidationChanged } from "../store/actions/profileEmailValidationChange";

// tslint:disable-next-line:no-let
let maybePreviousEmailValidated: Option<boolean> = none;

/**
 * This saga checks for the event of `profileLoadSuccess` and checks when the email validation is completed
 * in order to dispatch the event to mixpanel
 * @param initialEmailValidated: the initial email validate value from profile, before refresh
 */
export function* watchProfileEmailValidationChangedSaga(
  initialEmailValidated: Option<boolean>
): IterableIterator<Effect> {
  maybePreviousEmailValidated = initialEmailValidated;
  yield takeEvery(getType(profileLoadSuccess), checkProfileEmailChanged);
}

export function* checkProfileEmailChanged(
  action: ActionType<typeof profileLoadSuccess>
) {
  const profileUpdate = action.payload;

  // dispatch the action only if a previous state exists.
  const emailStateChanged = maybePreviousEmailValidated
    .map(x => x !== profileUpdate.is_email_validated)
    .getOrElse(false);

  if (emailStateChanged) {
    yield put(
      profileEmailValidationChanged(profileUpdate.is_email_validated || false)
    );
  }

  maybePreviousEmailValidated = fromNullable(profileUpdate.is_email_validated);
}
