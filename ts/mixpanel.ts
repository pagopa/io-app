import { Mixpanel } from "mixpanel-react-native";
import { mixpanelToken } from "./config";
import { getDeviceId } from "./utils/device";
import { GlobalState } from "./store/reducers/types";
import { updateMixpanelSuperProperties } from "./mixpanelConfig/superProperties";
import { updateMixpanelProfileProperties } from "./mixpanelConfig/profileProperties";

// eslint-disable-next-line
export let mixpanel: Mixpanel | undefined;

/**
 * Initialize mixpanel at start
 */
export const initializeMixPanel = async (state: GlobalState) => {
  if (mixpanel !== undefined) {
    return;
  }
  const trackAutomaticEvents = true;
  const privateInstance = new Mixpanel(mixpanelToken, trackAutomaticEvents);
  await privateInstance.init(
    undefined,
    undefined,
    "https://api-eu.mixpanel.com"
  );
  mixpanel = privateInstance;
  // On app first open
  // On profile page, when user opt-in
  await setupMixpanel(mixpanel, state);
};

const setupMixpanel = async (mp: Mixpanel, state: GlobalState) => {
  mp.optInTracking();
  mp.setUseIpAddressForGeolocation(false);

  await updateMixpanelSuperProperties(state);
  await updateMixpanelProfileProperties(state);
};

export const identifyMixpanel = async () => {
  // Identify the user using the device uniqueId
  await mixpanel?.identify(getDeviceId());
};

export const resetMixpanel = () => {
  // Reset mixpanel auto generated uniqueId
  mixpanel?.reset();
};

export const terminateMixpanel = () => {
  if (mixpanel) {
    mixpanel.flush();
    mixpanel.optOutTracking();
    mixpanel = undefined;
  }
};

/**
 * Track an event with properties
 * @param event
 * @param properties
 */
export const mixpanelTrack = (
  event: string,
  properties?: Record<string, unknown>
) => mixpanel?.track(event, properties);
