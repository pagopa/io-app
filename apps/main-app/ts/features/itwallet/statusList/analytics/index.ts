import { mixpanelTrack, registerSuperProperties } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";
import { ITW_TECH_EVENTS } from "../../analytics/enum";
import { getLastStatusListCheckTimestamp } from "../utils/storage";

export const trackItwStatusListFetchRegisterFailure = (reason: unknown) => {
  const eventName = ITW_TECH_EVENTS.ITW_BACKGROUND_TASK_REGISTER_FAILURE;
  const properties = buildEventProperties("TECH", undefined, {
    reason: reason instanceof Error ? reason.message : String(reason)
  });
  void mixpanelTrack(eventName, properties);
};

export const trackItwStatusListFetchRegistered = () => {
  const eventName = ITW_TECH_EVENTS.ITW_BACKGROUND_TASK_REGISTERED;
  const properties = buildEventProperties("TECH", undefined);
  void mixpanelTrack(eventName, properties);
};

/** Registers ITW Status List related properties to Mixpanel */
export const registerStatusListProperties = async () => {
  const lastCheckTime = await getLastStatusListCheckTimestamp();
  const lastCheckDate = lastCheckTime
    ? new Date(lastCheckTime).toISOString()
    : undefined;

  registerSuperProperties({
    ITW_BACKGROUND_LAST_CHECK_TIME: lastCheckDate
  });
};
