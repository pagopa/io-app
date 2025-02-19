import { SagaIterator } from "redux-saga";
import { select, takeLatest } from "typed-redux-saga/macro";
import { utmLinkCampaignSelector } from "../store/selectors";
import { isMixpanelInitializedSelector } from "../../mixpanel/store/selectors";
import { setIsMixpanelInitialized } from "../../mixpanel/store/actions";
import { utmLinkSetCampaign } from "../store/actions";
import { trackUtmLink } from "../analytics";
import { isMixpanelEnabled as isMixpanelEnabledSelector } from "./../../../store/reducers/persistedPreferences";

/**
 * This saga is responsible for tracking the UTM link campaign.
 * It listens for the mixpanel initialization and the UTM link campaign actions.
 * When either action is dispatched, it handles the latest action to avoid race conditions.
 */
export function* watchUtmLinkSaga(): SagaIterator {
  yield* takeLatest(
    [setIsMixpanelInitialized, utmLinkSetCampaign],
    handleApplicationInitialized
  );
}

function* handleApplicationInitialized(
  _:
    | ReturnType<typeof setIsMixpanelInitialized>
    | ReturnType<typeof utmLinkSetCampaign>
) {
  const utmCampaign = yield* select(utmLinkCampaignSelector);
  const isMixpanelInitialized = yield* select(isMixpanelInitializedSelector);
  const isMixpanelEnabled = yield* select(isMixpanelEnabledSelector);
  if (!utmCampaign || !isMixpanelInitialized || isMixpanelEnabled === false) {
    return;
  }
  trackUtmLink(utmCampaign);
}
