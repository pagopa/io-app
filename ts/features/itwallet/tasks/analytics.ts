import {
  enqueueMixpanelEvent,
  isMixpanelInstanceInitialized,
  mixpanelTrack
} from "../../../mixpanel";
import { buildEventProperties } from "../../../utils/analytics";
import { ITW_TECH_EVENTS } from "../analytics/enum";

export const trackItwBackgroundTaskRegisterFailure = (reason: unknown) => {
  const enventName = ITW_TECH_EVENTS.ITW_BACKGROUND_TASK_REGISTER_FAILURE;
  const props = buildEventProperties("TECH", undefined, {
    reason: reason instanceof Error ? reason.message : String(reason)
  });
  void mixpanelTrack(enventName, props);
};

export const trackItwBackgroundTaskRegistered = () => {
  const enventName = ITW_TECH_EVENTS.ITW_BACKGROUND_TASK_REGISTERED;
  const props = buildEventProperties("TECH", undefined);
  void mixpanelTrack(enventName, props);
};

/**
 * Tracks a background fetch wake-up event for observability purposes.
 *
 * TODO [SIW-4084]: This is a placeholder — the final event name and properties
 * will be defined in SIW-4090 once the Mixpanel background capabilities are confirmed.
 */
export const trackItwBackgroundTaskWakeUp = (userOptedIn: boolean | null) => {
  const id = Date.now().toString();
  const enventName = ITW_TECH_EVENTS.ITW_BACKGROUND_TASK_WAKE_UP;
  const props = buildEventProperties("TECH", undefined);

  if (isMixpanelInstanceInitialized()) {
    void mixpanelTrack(enventName, props);
  } else if (userOptedIn) {
    enqueueMixpanelEvent(enventName, id, props);
  }
};
