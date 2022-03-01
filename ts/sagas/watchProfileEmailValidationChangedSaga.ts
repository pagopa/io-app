import { fromNullable, none, Option } from "fp-ts/lib/Option";
import { put, takeEvery } from "typed-redux-saga/macro";
import { ActionType, getType } from "typesafe-actions";
import { profileLoadSuccess } from "../store/actions/profile";
import { profileEmailValidationChanged } from "../store/actions/profileEmailValidationChange";
import { ReduxSagaEffect } from "../types/utils";
import { isTestEnv } from "../utils/environment";

// eslint-disable-next-line
let maybePreviousEmailValidated: Option<boolean> = none;

/**
 * This saga checks for the event of `profileLoadSuccess` and checks when the email validation is completed
 * in order to dispatch the event to mixpanel
 * @param initialEmailValidated: the initial email validate value from profile, before refresh
 */
export function* watchProfileEmailValidationChangedSaga(
  initialEmailValidated: Option<boolean>
): IterableIterator<ReduxSagaEffect> {
  maybePreviousEmailValidated = initialEmailValidated;
  yield* takeEvery(getType(profileLoadSuccess), checkProfileEmailChanged);
}

export const isProfileEmailValidatedChanged = (
  previous: Option<boolean>,
  next: Option<boolean>
): boolean => previous.chain(p => next.map(n => n !== p)).getOrElse(false);

function* checkProfileEmailChanged(
  action: ActionType<typeof profileLoadSuccess>
) {
  const profileUpdate = action.payload;

  // dispatch the action only if a previous state exists.
  const emailStateChanged = isProfileEmailValidatedChanged(
    maybePreviousEmailValidated,
    fromNullable(profileUpdate.is_email_validated)
  );

  if (emailStateChanged) {
    yield* put(
      profileEmailValidationChanged(profileUpdate.is_email_validated || false)
    );
  }

  maybePreviousEmailValidated = fromNullable(profileUpdate.is_email_validated);
}

export const testableCheckProfileEmailChanged = isTestEnv
  ? checkProfileEmailChanged
  : undefined;
