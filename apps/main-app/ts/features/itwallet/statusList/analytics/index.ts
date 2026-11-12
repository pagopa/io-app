import { mixpanelTrack, registerSuperProperties } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";
import { ITW_TECH_EVENTS } from "../../analytics/enum";
import { MixPanelCredential } from "../../analytics/utils/types";
import { getLastStatusListCheckTimestamps } from "../utils/storage";

export const trackItwCredentialStatusUpdateFailure = (
  credential: MixPanelCredential,
  error: unknown
) => {
  void mixpanelTrack(
    ITW_TECH_EVENTS.ITW_CREDENTIAL_STATUS_UPDATE_FAILURE,
    buildEventProperties("TECH", undefined, {
      credential,
      reason: error instanceof Error ? error.message : String(error),
      error_type: error instanceof Error ? error.name || "unknown" : "unknown"
    })
  );
};

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
  const lastCheckTimes = await getLastStatusListCheckTimestamps();
  const lastCheckTime = lastCheckTimes.at(-1);
  const lastCheckDate = lastCheckTime
    ? new Date(lastCheckTime).toISOString()
    : undefined;

  registerSuperProperties({
    ITW_BACKGROUND_LAST_CHECK_TIME: lastCheckDate
  });
};
