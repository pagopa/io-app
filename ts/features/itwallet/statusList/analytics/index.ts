import { mixpanelTrack } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";
import { ITW_TECH_EVENTS } from "../../analytics/enum";

export const trackItwStatusListFetchRegisterFailure = (reason: unknown) => {
  const enventName = ITW_TECH_EVENTS.ITW_BACKGROUND_TASK_REGISTER_FAILURE;
  const properties = buildEventProperties("TECH", undefined, {
    reason: reason instanceof Error ? reason.message : String(reason)
  });
  void mixpanelTrack(enventName, properties);
};

export const trackItwStatusListFetchRegistered = () => {
  const eventName = ITW_TECH_EVENTS.ITW_BACKGROUND_TASK_REGISTERED;
  const properties = buildEventProperties("TECH", undefined);
  void mixpanelTrack(eventName, properties);
};

export const trackItwStatusListFetchUnregistered = () => {
  const eventName = ITW_TECH_EVENTS.ITW_BACKGROUND_TASK_UNREGISTERED;
  const properties = buildEventProperties("TECH", undefined);
  void mixpanelTrack(eventName, properties);
};

/**
 * TODO remove once the status list is implemented
 */
export const trackItwStatusListLastChecktime = (timestamp: string) => {
  const eventName = ITW_TECH_EVENTS.ITW_BACKGROUND_TASK_LAST_CHECK_TIME;
  const properties = buildEventProperties("TECH", undefined, { timestamp });
  void mixpanelTrack(eventName, properties);
};
