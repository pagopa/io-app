import { fromNullable, none, Option } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { Effect, put, takeEvery } from "redux-saga/effects";
import { ActionType, getType } from "typesafe-actions";
import { RTron } from "../boot/configureStoreAndPersistor";
import { emailValidationChanged } from "../store/actions/emailValidationChange";
import { profileLoadSuccess } from "../store/actions/profile";
import { ProfileState } from "../store/reducers/profile";

const getEmailValidated = (profile: ProfileState) => {
  return pot.isSome(profile)
    ? fromNullable(profile.value.is_email_validated)
    : none;
};

// tslint:disable-next-line:no-let
let maybePreviousEmailValidated: Option<boolean> = none;

/**
 * This saga check for the event of `profileLoadSuccess` and check when the email validation is completed
 * in order to dispatch the event to mixpanel
 * @param initialProfile: the initial profile before refresh
 */
export function* watchEmailValidatedChangedSaga(
  initialProfile: ProfileState
): IterableIterator<Effect> {
  RTron.log("StartingProfile:", initialProfile);
  maybePreviousEmailValidated = getEmailValidated(initialProfile);
  RTron.log("is_email_validated startup :", maybePreviousEmailValidated);
  yield takeEvery(getType(profileLoadSuccess), checkEmailChanged);
}

function* checkEmailChanged(action: ActionType<typeof profileLoadSuccess>) {
  const profileUpdate = action.payload;

  const emailStateChanged = maybePreviousEmailValidated
    .map(x => x !== profileUpdate.is_email_validated)
    .getOrElse(false);

  RTron.log(
    "Update profile: is email changed:",
    emailStateChanged,
    "new state",
    profileUpdate.is_email_validated
  );

  if (emailStateChanged) {
    yield put(
      emailValidationChanged(profileUpdate.is_email_validated || false)
    );
  }

  maybePreviousEmailValidated = fromNullable(profileUpdate.is_email_validated);
}
