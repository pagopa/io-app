import { Appearance, ColorSchemeName } from "react-native";
import { isScreenReaderEnabled } from "../utils/accessibility";
import { getAppVersion } from "../utils/appVersion";
import {
  getFontScale,
  isScreenLockSet as isScreenLockSetFunc
} from "../utils/device";
import { BiometricsType, getBiometricsType } from "../utils/biometrics";
import {
  NotificationPreferenceConfiguration,
  ServiceConfigurationTrackingType
} from "../screens/profile/analytics";

import { GlobalState } from "../store/reducers/types";

import { mixpanel } from "../mixpanel";
import { LoginSessionDuration } from "../features/fastLogin/analytics/optinAnalytics";
import {
  Property,
  PropertyToUpdate,
  loginSessionConfigHandler,
  notificationConfigurationHandler,
  serviceConfigHandler
} from "./mixpanelPropertyUtils";

type SuperProperties = {
  isScreenReaderEnabled: boolean;
  fontScale: number;
  appReadableVersion: string;
  colorScheme: ColorSchemeName;
  biometricTechnology: BiometricsType;
  isScreenLockSet: boolean;
  LOGIN_SESSION: LoginSessionDuration;
  NOTIFICATION_CONFIGURATION: NotificationPreferenceConfiguration;
  SERVICE_CONFIGURATION: ServiceConfigurationTrackingType;
};

export const updateMixpanelSuperProperties = async (
  state: GlobalState,
  forceUpdateFor?: PropertyToUpdate<SuperProperties>
) => {
  if (!mixpanel) {
    return;
  }

  const screenReaderEnabled: boolean = await isScreenReaderEnabled();
  const fontScale = await getFontScale();
  const biometricTechnology = await getBiometricsType();
  const isScreenLockSet = await isScreenLockSetFunc();
  const LOGIN_SESSION = loginSessionConfigHandler(state);
  const NOTIFICATION_CONFIGURATION = notificationConfigurationHandler(state);
  const SERVICE_CONFIGURATION = serviceConfigHandler(state);

  const superPropertiesObject: SuperProperties = {
    isScreenReaderEnabled: screenReaderEnabled,
    fontScale,
    appReadableVersion: getAppVersion(),
    colorScheme: Appearance.getColorScheme(),
    biometricTechnology,
    isScreenLockSet,
    LOGIN_SESSION,
    NOTIFICATION_CONFIGURATION,
    SERVICE_CONFIGURATION
  };

  if (forceUpdateFor) {
    forceUpdate<keyof SuperProperties>(superPropertiesObject, forceUpdateFor);
  }

  mixpanel.registerSuperProperties(superPropertiesObject);
};

const forceUpdate = <T extends keyof SuperProperties>(
  superPropertiesObject: SuperProperties,
  toUpdate: Property<SuperProperties, T>
) => {
  // eslint-disable-next-line functional/immutable-data
  superPropertiesObject[toUpdate.property] = toUpdate.value;
};
