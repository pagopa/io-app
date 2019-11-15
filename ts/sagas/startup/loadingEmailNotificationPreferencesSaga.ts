import { Option } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { Effect } from "redux-saga";
import { put, select, takeEvery } from "redux-saga/effects";
import { getType } from "typesafe-actions";
import { InitializedProfile } from "../../../definitions/backend/InitializedProfile";
import { customEmailChannelSetEnabled } from "../../store/actions/persistedPreferences";
import { profileLoadSuccess } from "../../store/actions/profile";
import { loadVisibleServices } from "../../store/actions/services";
import {
  visibleServicesSelector,
  VisibleServicesState
} from "../../store/reducers/entities/services/visibleServices";
import { isCustomEmailChannelEnabledSelector } from "../../store/reducers/persistedPreferences";
import { profileSelector, ProfileState } from "../../store/reducers/profile";

/**
 * A saga to match if the user has, on previous installations, customized settings related to the
 * forwarding of notifications on the verified email
 */
export function* checkEmailNotificationPreferencesSaga(): IterableIterator<
  Effect
> {
  const isCustomEmailChannelEnabled: Option<boolean> = yield select(
    isCustomEmailChannelEnabledSelector
  );
  if (isCustomEmailChannelEnabled.isNone()) {
    // tslint:disable-next-line:restrict-plus-operands
    yield takeEvery(
      [getType(profileLoadSuccess), getType(loadVisibleServices.success)],
      function*() {
        const potProfile: ProfileState = yield select(profileSelector);
        const potVisibleServices: VisibleServicesState = yield select(
          visibleServicesSelector
        );
        if (
          pot.isSome(potVisibleServices) &&
          pot.isSome(potProfile) &&
          InitializedProfile.is(potProfile.value)
        ) {
          const blockedChannels = pot
            .toOption(potProfile)
            .mapNullable(
              userProfile =>
                InitializedProfile.is(userProfile)
                  ? userProfile.blocked_inbox_or_channels
                  : null
            )
            .getOrElse({});

          const someCustomEmailPreferenceEnabled: boolean =
            pot.toUndefined(
              pot.map(potVisibleServices, services =>
                services
                  .map(
                    service =>
                      blockedChannels[service.service_id] &&
                      blockedChannels[service.service_id].indexOf("EMAIL") !==
                        -1
                  )
                  .find(item => item)
              )
            ) || false;

          // If the email notification for visible services are partially disabled, we enable the customization
          yield put(
            customEmailChannelSetEnabled(someCustomEmailPreferenceEnabled)
          );
        }
      }
    );
  }
}
