import { Appearance, ColorSchemeName } from "react-native";
import * as O from "fp-ts/Option";
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
} from "../features/settings/common/analytics/index.ts";
import { GlobalState } from "../store/reducers/types";
import { LoginSessionDuration } from "../features/authentication/fastLogin/analytics/optinAnalytics";
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
import { TrackCgnStatus } from "../features/bonus/cgn/analytics";
import { itwAuthLevelSelector } from "../features/itwallet/common/store/selectors/preferences.ts";
import { isConnectedSelector } from "../features/connectivity/store/selectors/index.ts";
import {
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
  ITW_STATUS_V2: ItwStatus;
  ITW_ID_V2: ItwId;
  ITW_PG_V2: ItwPg;
  ITW_TS_V2: ItwTs;
  ITW_CED_V2: ItwCed;
  SAVED_PAYMENT_METHOD?: number;
  CGN_STATUS: TrackCgnStatus;
  WELFARE_STATUS: ReadonlyArray<string>;
  CONNECTION_STATUS: ConnectivityStatus;
};

export const updateMixpanelSuperProperties = async (
  state: GlobalState,
  forceUpdateFor?: PropertyToUpdate<SuperProperties>
) => {
  if (!isMixpanelInstanceInitialized()) {
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
  const ITW_STATUS_V2 = walletStatusHandler(state);
  const ITW_ID_V2 = idStatusHandler(state);
  const ITW_PG_V2 = pgStatusHandler(state);
  const ITW_TS_V2 = tsStatusHandler(state);
  const ITW_CED_V2 = cedStatusHandler(state);
  const SAVED_PAYMENT_METHOD = paymentMethodsHandler(state);
  const CGN_STATUS = cgnStatusHandler(state);
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
    ITW_STATUS_V2,
    ITW_ID_V2,
    ITW_PG_V2,
    ITW_TS_V2,
    ITW_CED_V2,
    SAVED_PAYMENT_METHOD,
    CGN_STATUS,
    WELFARE_STATUS,
    CONNECTION_STATUS
  };

  if (forceUpdateFor) {
    forceUpdate<keyof SuperProperties>(superPropertiesObject, forceUpdateFor);
  }

  registerSuperProperties(superPropertiesObject);
};

const forceUpdate = <T extends keyof SuperProperties>(
  superPropertiesObject: SuperProperties,
  toUpdate: Property<SuperProperties, T>
) => {
  // eslint-disable-next-line functional/immutable-data
  superPropertiesObject[toUpdate.property] = toUpdate.value;
};

const walletStatusHandler = (state: GlobalState): ItwStatus => {
  const authLevel = itwAuthLevelSelector(state);
  return authLevel ? authLevel : "not_active";
};

const idStatusHandler = (state: GlobalState): ItwId => {
  const credentialsState = itwCredentialsSelector(state);
  return O.isSome(credentialsState.eid) ? "valid" : "not_available";
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
const offlineStatusHandler = (state: GlobalState): ConnectivityStatus => {
  const isConnected = isConnectedSelector(state);
  return isConnected ? "online" : "offline";
};
