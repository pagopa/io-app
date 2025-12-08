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
import {
  getMixpanelCredentialStatus,
  getPIDMixpanelStatus,
  ItwCredentialMixpanelStatus,
  ItwPIDStatus,
  ItwStatus
} from "../features/itwallet/analytics";
import { TrackCgnStatus } from "../features/bonus/cgn/analytics";
import { itwAuthLevelSelector } from "../features/itwallet/common/store/selectors/preferences.ts";
import { OfflineAccessReasonEnum } from "../features/ingress/store/reducer";
import { offlineAccessReasonSelector } from "../features/ingress/store/selectors";
import { isConnectedSelector } from "../features/connectivity/store/selectors";
import { itwLifecycleIsITWalletValidSelector } from "../features/itwallet/lifecycle/store/selectors";
import { CredentialType } from "../features/itwallet/common/utils/itwMocksUtils";
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
  ITW_STATUS_V2: ItwStatus;
  ITW_ID_V2?: ItwPIDStatus;
  ITW_PID: ItwPIDStatus;
  ITW_PG_V2?: ItwCredentialMixpanelStatus;
  ITW_TS_V2?: ItwCredentialMixpanelStatus;
  ITW_CED_V2?: ItwCredentialMixpanelStatus;
  ITW_PG_V3: ItwCredentialMixpanelStatus;
  ITW_TS_V3: ItwCredentialMixpanelStatus;
  ITW_CED_V3: ItwCredentialMixpanelStatus;
  SAVED_PAYMENT_METHOD?: number;
  CGN_STATUS: TrackCgnStatus;
  CDC_STATUS: number;
  WELFARE_STATUS: ReadonlyArray<string>;
  OFFLINE_ACCESS_REASON: string;
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
    const biometricTechnology = await getBiometricsType();
    const isScreenLockSet = await isScreenLockSetFunc();
    const LOGIN_SESSION = loginSessionConfigHandler(state);
    const NOTIFICATION_CONFIGURATION = notificationConfigurationHandler(state);
    const notificationsEnabled = await checkNotificationPermissions();
    const SERVICE_CONFIGURATION = serviceConfigHandler(state);
    const ITW_STATUS_V2 = walletStatusHandler(state);
    const ITW_PID = getPIDMixpanelStatus(state, true);
    const SAVED_PAYMENT_METHOD = paymentMethodsHandler(state);
    const CGN_STATUS = cgnStatusHandler(state);
    const CDC_STATUS = cdcStatusHandler(state);
    const WELFARE_STATUS = welfareStatusHandler(state);
    const OFFLINE_ACCESS_REASON = offlineReasonHandler(state);
    const CONNECTION_STATUS = offlineStatusHandler(state);

    const isItwL3 = itwLifecycleIsITWalletValidSelector(state);
    const ITW_PG_V3 = getMixpanelCredentialStatus(
      CredentialType.DRIVING_LICENSE,
      state,
      isItwL3
    );
    const ITW_TS_V3 = getMixpanelCredentialStatus(
      CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD,
      state,
      isItwL3
    );
    const ITW_CED_V3 = getMixpanelCredentialStatus(
      CredentialType.EUROPEAN_DISABILITY_CARD,
      state,
      isItwL3
    );

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
      ...(!isItwL3 && {
        ITW_ID_V2: getPIDMixpanelStatus(state, false),
        ITW_PG_V2: getMixpanelCredentialStatus(
          CredentialType.DRIVING_LICENSE,
          state
        ),
        ITW_TS_V2: getMixpanelCredentialStatus(
          CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD,
          state
        ),
        ITW_CED_V2: getMixpanelCredentialStatus(
          CredentialType.EUROPEAN_DISABILITY_CARD,
          state
        )
      }),
      ITW_PID,
      ITW_PG_V3,
      ITW_TS_V3,
      ITW_CED_V3,
      SAVED_PAYMENT_METHOD,
      CGN_STATUS,
      CDC_STATUS,
      WELFARE_STATUS,
      OFFLINE_ACCESS_REASON,
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

const walletStatusHandler = (state: GlobalState): ItwStatus => {
  const authLevel = itwAuthLevelSelector(state);
  return authLevel ? authLevel : "not_active";
};

const offlineStatusHandler = (state: GlobalState): ConnectivityStatus => {
  const isConnected = isConnectedSelector(state);
  return isConnected ? "online" : "offline";
};

const offlineReasonHandler = (
  state: GlobalState
): OfflineAccessReasonEnum | "not_available" => {
  const offlineAccessReason = offlineAccessReasonSelector(state);
  return offlineAccessReason ? offlineAccessReason : "not_available";
};
