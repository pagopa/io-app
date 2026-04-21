import {
  enqueueMixpanelEvent,
  isMixpanelInstanceInitialized,
  mixpanelTrack
} from "../../../mixpanel";
import { buildEventProperties } from "../../../utils/analytics";
import { ITW_TECH_EVENTS } from "../analytics/enum";

/**
 * Tracks a background fetch wake-up event for observability purposes.
 *
 * TODO [SIW-4084]: This is a placeholder — the final event name and properties
 * will be defined in SIW-4090 once the Mixpanel background capabilities are confirmed.
 */
export const trackItwBackgroundFetchWakeUp = (userOptedIn: boolean | null) => {
  const id = Date.now().toString();
  const enventName = ITW_TECH_EVENTS.ITW_BACKGROUND_FETCH_WAKE_UP;
  const props = buildEventProperties("TECH", undefined);

  if (isMixpanelInstanceInitialized()) {
    void mixpanelTrack(enventName, props);
  } else if (userOptedIn) {
    enqueueMixpanelEvent(enventName, id, props);
  }
};
