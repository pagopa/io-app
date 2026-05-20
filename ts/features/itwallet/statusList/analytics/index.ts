import { mixpanelTrack } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";
import { ITW_TECH_EVENTS } from "../../analytics/enum";

export const trackItwStatusListFetchRegisterFailure = (reason: unknown) => {
  const enventName = ITW_TECH_EVENTS.ITW_BACKGROUND_TASK_REGISTER_FAILURE;
  const props = buildEventProperties("TECH", undefined, {
    reason: reason instanceof Error ? reason.message : String(reason)
  });
  void mixpanelTrack(enventName, props);
};

export const trackItwStatusListFetchRegistered = () => {
  const enventName = ITW_TECH_EVENTS.ITW_BACKGROUND_TASK_REGISTERED;
  const props = buildEventProperties("TECH", undefined);
  void mixpanelTrack(enventName, props);
};

/**
 * TODO remove once the status list is implemented
 */
export const trackItwStatusListLastChecktime = (timestamp: string) => {
  const enventName = ITW_TECH_EVENTS.ITW_BACKGROUND_TASK_LAST_CHECK_TIME;
  const props = buildEventProperties("TECH", undefined, { timestamp });
  void mixpanelTrack(enventName, props);
};
