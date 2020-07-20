import DeviceInfo from "react-native-device-info";
import { MixpanelInstance } from "react-native-mixpanel";
import { mixpanelToken } from "./config";
import { isScreenReaderEnabled } from "./utils/accessibility";

// tslint:disable-next-line:no-let
export let mixpanel: MixpanelInstance | undefined;

/**
 * Initialize mixpanel at start
 */
const initializeMixPanel = async () => {
  const privateInstance = new MixpanelInstance(mixpanelToken);
  await privateInstance.initialize();
  mixpanel = privateInstance;
  await registerSuperProperties(mixpanel);
};

initializeMixPanel()
  .then()
  .catch(() => 0);

const registerSuperProperties = async (mp: MixpanelInstance) => {
  const screenReaderEnabled: boolean = await isScreenReaderEnabled();
  await mp.registerSuperProperties({
    isScreenReaderEnabled: screenReaderEnabled,
    fontScale: DeviceInfo.getFontScaleSync(),
    appReadableVersion: DeviceInfo.getReadableVersion()
  });
};
