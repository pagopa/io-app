import DeviceInfo from "react-native-device-info";
import { MixpanelInstance } from "react-native-mixpanel";
import { Platform } from "react-native";
import { mixpanelToken } from "./config";
import { isScreenReaderEnabled } from "./utils/accessibility";
import { getAppVersion } from "./utils/appVersion";

// eslint-disable-next-line
export let mixpanel: MixpanelInstance | undefined;

/**
 * Initialize mixpanel at start
 */
const initializeMixPanel = async () => {
  const privateInstance = new MixpanelInstance(mixpanelToken);
  await privateInstance.initialize();
  mixpanel = privateInstance;
  await setupMixpanel(mixpanel);
};

initializeMixPanel()
  .then()
  .catch(() => 0);

const setupMixpanel = async (mp: MixpanelInstance) => {
  const screenReaderEnabled: boolean = await isScreenReaderEnabled();
  await mp.disableIpAddressGeolocalization();
  await mp.registerSuperProperties({
    isScreenReaderEnabled: screenReaderEnabled,
    fontScale: DeviceInfo.getFontScaleSync(),
    appReadableVersion: getAppVersion()
  });

  // Identify the user using the device uniqueId
  await mp.identify(DeviceInfo.getUniqueId());
};

export const setMixpanelPushNotificationToken = (token: string) => {
  if (mixpanel) {
    if (Platform.OS === "ios") {
      return mixpanel.addPushDeviceToken(token);
    }
    if (Platform.OS === "android") {
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
