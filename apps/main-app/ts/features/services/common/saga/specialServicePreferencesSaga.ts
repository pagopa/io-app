import { call, select } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { loadServicePreference } from "../../details/store/actions/preference";
import { isServicePreferenceResponseSuccess } from "../../details/types/ServicePreferenceResponse";
import { updateMixpanelProfileProperties } from "../../../../mixpanelConfig/profileProperties";
import { pnMessagingServiceIdSelector } from "../../../../store/reducers/backendStatus/remoteConfig";

/**
 * This saga is used to update the profile properties after
 * special services action status changes (for now, only SEND
 * is added as a profile property, nonetheless this saga can
 * later be used to trigger an update for other services)
 */
export function* specialServicePreferencesSaga(
  action: ActionType<typeof loadServicePreference.success>
) {
  // Make sure that the response is successfull and it is
  // related to the services we listen for (at the moment
  // only SEND)
  const payload = action.payload;
  if (isServicePreferenceResponseSuccess(payload)) {
    const actionServiceId = payload.id;
    const pnServiceId = yield* select(pnMessagingServiceIdSelector);
    if (actionServiceId === pnServiceId) {
      const globalState = yield* select();
      yield* call(updateMixpanelProfileProperties, globalState);
    }
  }
}
