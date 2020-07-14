import DeviceInfo from "react-native-device-info";
import { mixpanel } from "../mixpanel";
import { isScreenReaderEnabled } from "../utils/accessibility";

/**
 * Initialize the superProperties for mixpanel
 */
export default function* root() {
  if (mixpanel !== undefined) {
    const screenReaderEnabled: boolean = yield isScreenReaderEnabled();
    yield mixpanel.registerSuperProperties({
      isScreenReaderEnabled: screenReaderEnabled,
      fontScale: DeviceInfo.getFontScaleSync()
    });
  }
}
