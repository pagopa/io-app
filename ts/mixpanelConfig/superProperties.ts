import * as Sentry from "@sentry/react-native";
import { Appearance, ColorSchemeName } from "react-native";
import {
  isMixpanelInstanceInitialized,
  registerSuperProperties
} from "../mixpanel.ts";
import { isScreenReaderEnabled } from "../utils/accessibility";
import { getAppVersion } from "../utils/appVersion";
import {
  getFontScale,
  isScreenLockSet as isScreenLockSetFunc
} from "../utils/device";
import { BiometricsType, getBiometricsType } from "../utils/biometrics";
import {
  getNotificationPermissionType,
  NotificationPermissionType,
  NotificationPreferenceConfiguration,
  ServiceConfigurationTrackingType
} from "../features/settings/common/analytics";
import { GlobalState } from "../store/reducers/types";
import { LoginSessionDuration } from "../features/authentication/fastLogin/analytics/optinAnalytics";
import { checkNotificationPermissions } from "../features/pushNotifications/utils";
import { TrackCgnStatus } from "../features/bonus/cgn/analytics";
import { isConnectedSelector } from "../features/connectivity/store/selectors";
import {
  cdcStatusHandler,
  cgnStatusHandler,
  loginSessionConfigHandler,
  notificationConfigurationHandler,
  paymentMethodsHandler,
  Property,
  PropertyToUpdate,
  serviceConfigHandler,
  welfareStatusHandler
} from "./mixpanelPropertyUtils";

type ConnectivityStatus = "online" | "offline";

type SuperProperties = {
  isScreenReaderEnabled: boolean;
  fontScale: number;
  appReadableVersion: string;
  colorScheme: ColorSchemeName;
  biometricTechnology: BiometricsType;
  isScreenLockSet: boolean;
  LOGIN_SESSION: LoginSessionDuration;
  NOTIFICATION_CONFIGURATION: NotificationPreferenceConfiguration;
  NOTIFICATION_PERMISSION: NotificationPermissionType;
  SERVICE_CONFIGURATION: ServiceConfigurationTrackingType;
  SAVED_PAYMENT_METHOD?: number;
  CGN_STATUS: TrackCgnStatus;
  CDC_STATUS: number;
  WELFARE_STATUS: ReadonlyArray<string>;
  CONNECTION_STATUS: ConnectivityStatus;
};

export const updateMixpanelSuperProperties = async (
  state: GlobalState,
  forceUpdateFor?: PropertyToUpdate<SuperProperties>
) => {
  try {
    if (!isMixpanelInstanceInitialized()) {
      return;
    }
    const screenReaderEnabled: boolean = await isScreenReaderEnabled();
    const fontScale = await getFontScale();
    const biometricTechnology = await getBiometricsType(false);
    const isScreenLockSet = await isScreenLockSetFunc();
    const LOGIN_SESSION = loginSessionConfigHandler(state);
    const NOTIFICATION_CONFIGURATION = notificationConfigurationHandler(state);
    const notificationsEnabled = await checkNotificationPermissions();
    const SERVICE_CONFIGURATION = serviceConfigHandler(state);
    const SAVED_PAYMENT_METHOD = paymentMethodsHandler(state);
    const CGN_STATUS = cgnStatusHandler(state);
    const CDC_STATUS = cdcStatusHandler(state);
    const WELFARE_STATUS = welfareStatusHandler(state);
    const CONNECTION_STATUS = offlineStatusHandler(state);

    const superPropertiesObject: SuperProperties = {
      isScreenReaderEnabled: screenReaderEnabled,
      fontScale,
      appReadableVersion: getAppVersion(),
      colorScheme: Appearance.getColorScheme(),
      biometricTechnology,
      isScreenLockSet,
      LOGIN_SESSION,
      NOTIFICATION_CONFIGURATION,
      NOTIFICATION_PERMISSION:
        getNotificationPermissionType(notificationsEnabled),
      SERVICE_CONFIGURATION,
      SAVED_PAYMENT_METHOD,
      CGN_STATUS,
      CDC_STATUS,
      WELFARE_STATUS,
      CONNECTION_STATUS
    };

    if (forceUpdateFor) {
      forceUpdate<keyof SuperProperties>(superPropertiesObject, forceUpdateFor);
    }

    registerSuperProperties(superPropertiesObject);
  } catch (e) {
    Sentry.captureException(e);
  }
};

const forceUpdate = <T extends keyof SuperProperties>(
  superPropertiesObject: SuperProperties,
  toUpdate: Property<SuperProperties, T>
) => {
  // eslint-disable-next-line functional/immutable-data
  superPropertiesObject[toUpdate.property] = toUpdate.value;
};

const offlineStatusHandler = (state: GlobalState): ConnectivityStatus => {
  const isConnected = isConnectedSelector(state);
  return isConnected ? "online" : "offline";
};
