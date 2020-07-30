import DeviceInfo from "react-native-device-info";
import { MixpanelInstance } from "react-native-mixpanel";
import { mixpanelToken } from "./config";
import { isScreenReaderEnabled } from "./utils/accessibility";
import { getAppVersion } from "./utils/appVersion";

// tslint:disable-next-line:no-let
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
};
