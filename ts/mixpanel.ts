import { MixpanelInstance } from "react-native-mixpanel";
import { mixpanelToken } from "./config";
import { isAndroid, isIos } from "./utils/platform";
import { getDeviceId } from "./utils/device";
import { GlobalState } from "./store/reducers/types";
import { updateMixpanelSuperProperties } from "./mixpanelConfig/superProperties";
import { updateMixpanelProfileProperties } from "./mixpanelConfig/profileProperties";

// eslint-disable-next-line
export let mixpanel: MixpanelInstance | undefined;

/**
 * Initialize mixpanel at start
 */
export const initializeMixPanel = async (state: GlobalState) => {
  if (mixpanel !== undefined) {
    return;
  }
  const privateInstance = new MixpanelInstance(mixpanelToken);
  await privateInstance.initialize();
  mixpanel = privateInstance;
  // On app first open
  // On profile page, when user opt-in
  await setupMixpanel(mixpanel, state);
};

const setupMixpanel = async (mp: MixpanelInstance, state: GlobalState) => {
  await mp.optInTracking();
  // on iOS it can be deactivate by invoking a SDK method
  // on Android it can be done adding an extra config in AndroidManifest
  // see https://help.mixpanel.com/hc/en-us/articles/115004494803-Disable-Geolocation-Collection
  if (isIos) {
    await mp.disableIpAddressGeolocalization();
  }

  await updateMixpanelSuperProperties(state);
  await updateMixpanelProfileProperties(state);
};

export const identifyMixpanel = async () => {
  // Identify the user using the device uniqueId
  await mixpanel?.identify(getDeviceId());
};

export const resetMixpanel = async () => {
  // Reset mixpanel auto generated uniqueId
  await mixpanel?.reset();
};

export const terminateMixpanel = async () => {
  if (mixpanel) {
    await mixpanel.flush();
    await mixpanel.optOutTracking();
    mixpanel = undefined;
  }
  return Promise.resolve();
};

export const setMixpanelPushNotificationToken = (token: string) => {
  if (mixpanel) {
    if (isIos) {
      return mixpanel.addPushDeviceToken(token);
    }
    if (isAndroid) {
      return mixpanel.setPushRegistrationId(token);
    }
  }
  return Promise.resolve();
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
