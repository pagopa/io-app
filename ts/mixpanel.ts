import { Appearance } from "react-native";
import { MixpanelInstance } from "react-native-mixpanel";
import { mixpanelToken } from "./config";
import { isScreenReaderEnabled } from "./utils/accessibility";
import { getAppVersion } from "./utils/appVersion";
import { isAndroid, isIos } from "./utils/platform";
import {
  getDeviceId,
  getFontScale,
  isScreenLockSet as isScreenLockSetFunc
} from "./utils/device";
import { getBiometricsType } from "./utils/biometrics";

// eslint-disable-next-line
export let mixpanel: MixpanelInstance | undefined;

/**
 * Initialize mixpanel at start
 */
export const initializeMixPanel = async (optedIn: boolean) => {
  if (mixpanel !== undefined) {
    if (optedIn) {
      // During the onboarding flow, Mixpanel is already initialized.
      // We need to identify the user if the user opted in.
      await mixpanel.identify(getDeviceId());
    }
    return;
  }
  const privateInstance = new MixpanelInstance(mixpanelToken);
  await privateInstance.initialize();
  mixpanel = privateInstance;
  await setupMixpanel(mixpanel, optedIn);
};

const setupMixpanel = async (mp: MixpanelInstance, optedIn: boolean) => {
  const screenReaderEnabled: boolean = await isScreenReaderEnabled();
  await mp.optInTracking();
  // on iOS it can be deactivate by invoking a SDK method
  // on Android it can be done adding an extra config in AndroidManifest
  // see https://help.mixpanel.com/hc/en-us/articles/115004494803-Disable-Geolocation-Collection
  if (isIos) {
    await mp.disableIpAddressGeolocalization();
  }
  const fontScale = await getFontScale();
  const biometricTechnology = await getBiometricsType();
  const isScreenLockSet = await isScreenLockSetFunc();
  await mp.registerSuperProperties({
    isScreenReaderEnabled: screenReaderEnabled,
    fontScale,
    appReadableVersion: getAppVersion(),
    colorScheme: Appearance.getColorScheme(),
    biometricTechnology,
    isScreenLockSet
  });
  if (optedIn) {
    // In the profile screen, the user can opt-in/opt-out to/from Mixpanel.
    // If the user opted in, we need to identify the user.
    await mp.identify(getDeviceId());
  }
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
