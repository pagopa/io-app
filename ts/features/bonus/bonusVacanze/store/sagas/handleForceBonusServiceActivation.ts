import * as pot from "@pagopa/ts-commons/lib/pot";
import * as E from "fp-ts/lib/Either";
import { SagaIterator } from "redux-saga";
import { put, select } from "typed-redux-saga/macro";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";
import { profileUpsert } from "../../../../../store/actions/profile";
import { profileSelector } from "../../../../../store/reducers/profile";
import { getBlockedChannels } from "../../../../../utils/profile";
import { availableBonusTypesSelectorFromId } from "../reducers/availableBonusesTypes";

// handle a profile update if the service related to the bonus is in its blocked channel
export function* handleForceBonusServiceActivation(
  bonusTypeId: number
): SagaIterator {
  // first: check if we have data about bonus type
  const bonusVacanze: ReturnType<
    ReturnType<typeof availableBonusTypesSelectorFromId>
  > = yield* select(availableBonusTypesSelectorFromId(bonusTypeId));
  // no data
  if (bonusVacanze === undefined) {
    return;
  }
  const serviceId = ServiceId.decode(bonusVacanze.service_id);
  // no service id
  if (E.isLeft(serviceId)) {
    return;
  }
  // retrieve profile from store
  const profile: ReturnType<typeof profileSelector> = yield* select(
    profileSelector
  );
  // compute the updated blacklist if the serviceId is in it, undefined if no updated is needed
  const newBlockedInboxOrChannel = pot.getOrElse(
    pot.map(profile, p => {
      const isBlocked = Object.keys(p.blocked_inbox_or_channels || {}).some(
        s => s === serviceId.right
      );
      if (isBlocked) {
        return getBlockedChannels(
          profile,
          serviceId.right
        )({
          email: true,
          inbox: true,
          push: true,
          can_access_message_read_status: true
        });
      }
      return undefined;
    }),
    undefined
  );
  if (newBlockedInboxOrChannel) {
    // update the profile
    yield* put(
      profileUpsert.request({
        blocked_inbox_or_channels: newBlockedInboxOrChannel
      })
    );
  }
}
