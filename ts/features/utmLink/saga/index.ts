import { SagaIterator } from "redux-saga";
import { put, select, takeLatest } from "typed-redux-saga/macro";
import {
  utmLinkCampaignSelector,
  utmLinkMediumSelector,
  utmLinkSourceSelector
} from "../store/selectors";
import { isMixpanelInitializedSelector } from "../../mixpanel/store/selectors";
import { setIsMixpanelInitialized } from "../../mixpanel/store/actions";
import { utmLinkClearParams, utmLinkSetParams } from "../store/actions";
import { trackUtmLink } from "../analytics";
import { isMixpanelEnabled as isMixpanelEnabledSelector } from "./../../../store/reducers/persistedPreferences";

/**
 * This saga is responsible for tracking the UTM link campaign.
 * It listens for the mixpanel initialization and the UTM link campaign actions.
 * When either action is dispatched, it handles the latest action to avoid race conditions.
 */
export function* watchUtmLinkSaga(): SagaIterator {
  yield* takeLatest(
    [setIsMixpanelInitialized, utmLinkSetParams],
    handleUtmLink
  );
}

function* handleUtmLink(
  _:
    | ReturnType<typeof setIsMixpanelInitialized>
    | ReturnType<typeof utmLinkSetParams>
) {
  const utmSource = yield* select(utmLinkSourceSelector);
  const utmMedium = yield* select(utmLinkMediumSelector);
  const utmCampaign = yield* select(utmLinkCampaignSelector);
  const isMixpanelInitialized = yield* select(isMixpanelInitializedSelector);
  const isMixpanelEnabled = yield* select(isMixpanelEnabledSelector);
  if (
    !utmSource ||
    !utmMedium ||
    !isMixpanelInitialized ||
    isMixpanelEnabled === false
  ) {
    return;
  }
  // Track the UTM link campaign
  trackUtmLink(utmSource, utmMedium, utmCampaign);
  // Clear the UTM link params
  yield* put(utmLinkClearParams());
}
