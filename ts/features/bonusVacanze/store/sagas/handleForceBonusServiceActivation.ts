import * as pot from "italia-ts-commons/lib/pot";
import { SagaIterator } from "redux-saga";
import { put } from "redux-saga/effects";
import { select } from "redux-saga/effects";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { profileUpsert } from "../../../../store/actions/profile";
import { profileSelector } from "../../../../store/reducers/profile";
import { getBlockedChannels } from "../../../../utils/profile";
import { availableBonusTypesSelectorFromId } from "../reducers/availableBonusesTypes";

// handle a profile update if the service related to the bonus is in the profile blocked channel
export function* handleForceBonusServiceActivation(
  bonusTypeId: number
): SagaIterator {
  // first check if we know about the service
  const maybeBonusVacanze: ReturnType<
    ReturnType<typeof availableBonusTypesSelectorFromId>
  > = yield select(availableBonusTypesSelectorFromId(bonusTypeId));
  // no data about bonus
  if (maybeBonusVacanze.isNone()) {
    return;
  }
  const bonusVacanze = maybeBonusVacanze.value;
  const serviceId = bonusVacanze.service_id;
  // no service id
  if (serviceId === undefined) {
    return;
  }
  // retrieve profile from store
  const profile: ReturnType<typeof profileSelector> = yield select(
    profileSelector
  );
  // compute the updated blacklist if the serviceId is in it, undefined if no updated is needed
  const newBlockedInboxOrChannel = pot.getOrElse(
    pot.map(profile, p => {
      const isBlocked = Object.keys(p.blocked_inbox_or_channels || {}).some(
        s => s === serviceId
      );
      if (isBlocked) {
        return getBlockedChannels(profile, serviceId as ServiceId)({
          email: true,
          inbox: true,
          push: true
        });
      }
      return undefined;
    }),
    undefined
  );
  if (newBlockedInboxOrChannel) {
    // update the profile
    yield put(
      profileUpsert.request({
        blocked_inbox_or_channels: newBlockedInboxOrChannel
      })
    );
  }
}
