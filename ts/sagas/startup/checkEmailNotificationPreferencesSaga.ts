import * as O from "fp-ts/lib/Option";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { SagaIterator } from "redux-saga";
import {
  cancel,
  fork,
  put,
  select,
  take,
  takeEvery
} from "typed-redux-saga/macro";
import { getType } from "typesafe-actions";
import { pipe } from "fp-ts/lib/function";
import { BlockedInboxOrChannels } from "../../../definitions/backend/BlockedInboxOrChannels";
import { customEmailChannelSetEnabled } from "../../store/actions/persistedPreferences";
import { profileLoadSuccess } from "../../store/actions/profile";
import { loadVisibleServices } from "../../store/actions/services";
import {
  visibleServicesSelector,
  VisibleServicesState
} from "../../store/reducers/entities/services/visibleServices";
import { isCustomEmailChannelEnabledSelector } from "../../store/reducers/persistedPreferences";
import { profileSelector, ProfileState } from "../../store/reducers/profile";
import { ReduxSagaEffect } from "../../types/utils";

/**
 * A saga to match at the first startup if the user has customized settings related to the
 * forwarding of notifications on the verified email within previous installations
 */
export function* watchEmailNotificationPreferencesSaga(): Generator<
  ReduxSagaEffect,
  void,
  any
> {
  const isCustomEmailChannelEnabled: ReturnType<
    typeof isCustomEmailChannelEnabledSelector
  > = yield* select(isCustomEmailChannelEnabledSelector);

  // if we know about user choice do nothing
  if (pot.isSome(isCustomEmailChannelEnabled)) {
    return;
  }

  // check if the user has any services with blocked email channel
  const checkSaga = yield* fork(checkEmailNotificationPreferencesSaga);
  yield* take(customEmailChannelSetEnabled);
  yield* cancel(checkSaga);
}

export function* checkEmailNotificationPreferencesSaga(): SagaIterator {
  yield* takeEvery(
    [getType(profileLoadSuccess), getType(loadVisibleServices.success)],
    emailNotificationPreferencesSaga
  );
}

export function* emailNotificationPreferencesSaga(): SagaIterator {
  const potProfile: ProfileState = yield* select(profileSelector);
  const potVisibleServices: VisibleServicesState = yield* select(
    visibleServicesSelector
  );
  /**
   * if we have a visible services and a profile (with a defined blocked_inbox_or_channels)
   * check if there is at least a service with EMAIL channel blocked. This means user has done
   * a custom choice
   */
  const potCustomEmailChannelEnabled = pot.map(
    potVisibleServices,
    visibleService => {
      const maybeSomeEmailBlocked = pot.map(potProfile, profile => {
        // custom email could be true only if profile.is_email_enabled === true
        // and the user made some optin on email channels
        if (profile.is_email_enabled === false) {
          return false;
        }
        const blockedChannels: BlockedInboxOrChannels = pipe(
          profile.blocked_inbox_or_channels,
          O.fromNullable,
          O.getOrElse(() => ({}))
        );
        return (
          visibleService.findIndex(
            service =>
              blockedChannels[service.service_id] &&
              blockedChannels[service.service_id].indexOf("EMAIL") !== -1
          ) !== -1
        );
      });
      return pot.getOrElse(maybeSomeEmailBlocked, false);
    }
  );
  // If the email notification for visible services are partially disabled
  // (only for some services), the customization is enabled
  yield* put(
    customEmailChannelSetEnabled(
      pot.getOrElse(potCustomEmailChannelEnabled, false)
    )
  );
}
