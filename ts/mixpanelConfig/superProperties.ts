import { Appearance, ColorSchemeName } from "react-native";
import { isScreenReaderEnabled } from "../utils/accessibility";
import { getAppVersion } from "../utils/appVersion";
import {
  getFontScale,
  isScreenLockSet as isScreenLockSetFunc
} from "../utils/device";
import { BiometricsType, getBiometricsType } from "../utils/biometrics";
import {
  NotificationPermissionType,
  NotificationPreferenceConfiguration,
  ServiceConfigurationTrackingType,
  getNotificationPermissionType
} from "../screens/profile/analytics";

import { GlobalState } from "../store/reducers/types";

import { mixpanel } from "../mixpanel";
import { LoginSessionDuration } from "../features/fastLogin/analytics/optinAnalytics";
import { checkNotificationPermissions } from "../features/pushNotifications/utils";
import {
  ItwCed,
  ItwId,
  ItwPg,
  ItwStatus,
  ItwTs
} from "../features/itwallet/analytics";
import {
  itwCredentialsByTypeSelector,
  itwCredentialsSelector
} from "../features/itwallet/credentials/store/selectors";
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
  NOTIFICATION_PERMISSION: NotificationPermissionType;
  SERVICE_CONFIGURATION: ServiceConfigurationTrackingType;
  ITW_STATUS: ItwStatus;
  ITW_ID: ItwId;
  ITW_PG: ItwPg;
  ITW_TS: ItwTs;
  ITW_CED: ItwCed;
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
  const notificationsEnabled = await checkNotificationPermissions();
  const SERVICE_CONFIGURATION = serviceConfigHandler(state);
  const ITW_STATUS = walletStatusHandler();
  const ITW_ID = idStatusHandler(state);
  const ITW_PG = pgStatusHandler(state);
  const ITW_TS = tsStatusHandler(state);
  const ITW_CED = cedStatusHandler(state);

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
    ITW_STATUS,
    ITW_ID,
    ITW_PG,
    ITW_TS,
    ITW_CED
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

const walletStatusHandler = (): ItwStatus => "L2";

const idStatusHandler = (state: GlobalState): ItwId => {
  const credentialsState = itwCredentialsSelector(state);
  return credentialsState.eid ? "valid" : "not_available";
};
const pgStatusHandler = (state: GlobalState): ItwPg => {
  const credentialsByType = itwCredentialsByTypeSelector(state);
  return credentialsByType.MDL ? "valid" : "not_available";
};
const tsStatusHandler = (state: GlobalState): ItwTs => {
  const credentialsByType = itwCredentialsByTypeSelector(state);
  return credentialsByType.EuropeanHealthInsuranceCard
    ? "valid"
    : "not_available";
};
const cedStatusHandler = (state: GlobalState): ItwCed => {
  const credentialsByType = itwCredentialsByTypeSelector(state);
  return credentialsByType.EuropeanDisabilityCard ? "valid" : "not_available";
};
