import { fromNullable, none, Option, some } from "fp-ts/lib/Option";
import { Effect, take } from "redux-saga/effects";
import { ActionType, getType } from "typesafe-actions";
import { InitializedProfile } from "../../../definitions/backend/InitializedProfile";
import { mixpanel } from "../../mixpanel";
import { profileLoadSuccess } from "../../store/actions/profile";

const emailValidationCompletedEvent = "EMAIL_VALIDATION_COMPLETED";

/**
 * This saga check for the event of `profileLoadSuccess` and check when the email validation is completed
 * in order to dispatch the event to mixpanel
 */
export function* dispatchEmailValidationToMixpanel(): IterableIterator<Effect> {
  // tslint:disable-next-line:no-let
  let previousProfile: Option<InitializedProfile> = none;

  while (true) {
    const profileUpdateAction: ActionType<
      typeof profileLoadSuccess
    > = yield take(getType(profileLoadSuccess));
    const profileUpdate = profileUpdateAction.payload;

    previousProfile
      .filter(
        pp =>
          (!pp.is_email_validated && profileUpdate.is_email_validated) || false
      )
      .chain(_ => fromNullable(mixpanel))
      .map(mp => mp.track(emailValidationCompletedEvent));

    previousProfile = some(profileUpdate);
  }
}
