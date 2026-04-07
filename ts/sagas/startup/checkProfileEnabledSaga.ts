import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { call, put, take } from "typed-redux-saga/macro";
import { ActionType, getType } from "typesafe-actions";

import { InitializedProfile } from "../../../definitions/backend/InitializedProfile";
import {
  profileFirstLogin,
  profileUpsert
} from "../../features/settings/common/store/actions";
import {
  hasProfileEmail,
  isProfileFirstOnBoarding
} from "../../features/settings/common/store/utils/guards";
import { startApplicationInitialization } from "../../store/actions/application";
import { ReduxSagaEffect } from "../../types/utils";

export function* checkProfileEnabledSaga(
  profile: InitializedProfile
): Generator<
  ReduxSagaEffect,
  void,
  | ActionType<(typeof profileUpsert)["failure"]>
  | ActionType<(typeof profileUpsert)["success"]>
> {
  const atv = pipe(
    profile.accepted_tos_version,
    O.fromNullable,
    O.getOrElse(() => 0)
  );
  const shouldEnableInbox = !profile.is_inbox_enabled && atv > 0;
  const tosNotAccepted = atv === 0;
  // auto-update for those profiles that have been fallen in a buggy scenario
  // see https://www.pivotaltracker.com/story/show/174845929
  if (shouldEnableInbox) {
    yield* call(enableProfileInboxWebhook);
  }
  if (
    tosNotAccepted &&
    (!hasProfileEmail(profile) ||
      !profile.is_inbox_enabled ||
      !profile.is_webhook_enabled)
  ) {
    // Upsert the user profile to enable inbox and webhook
    yield* call(enableProfileInboxWebhook);
    const action = yield* take<
      ActionType<typeof profileUpsert.failure | typeof profileUpsert.success>
    >([profileUpsert.success, profileUpsert.failure]);
    // We got an error
    if (action.type === getType(profileUpsert.failure)) {
      // Restart the initialization loop to let the user retry.
      // FIXME: show an error message
      yield* put(startApplicationInitialization());
    } else {
      // First time login
      if (isProfileFirstOnBoarding(profile)) {
        yield* put(profileFirstLogin());
      }
    }
  }
}

function* enableProfileInboxWebhook() {
  yield* put(
    profileUpsert.request({
      is_inbox_enabled: true,
      is_webhook_enabled: true
    })
  );
}
