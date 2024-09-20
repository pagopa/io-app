import * as O from "fp-ts/lib/Option";
import { mixpanel } from "../mixpanel";
import { GlobalState } from "../store/reducers/types";
import { LoginSessionDuration } from "../features/fastLogin/analytics/optinAnalytics";
import { BiometricsType, getBiometricsType } from "../utils/biometrics";
import {
  NotificationPermissionType,
  NotificationPreferenceConfiguration,
  ServiceConfigurationTrackingType,
  getNotificationPermissionType
} from "../screens/profile/analytics";
import { idpSelector } from "../store/reducers/authentication";
import { tosVersionSelector } from "../store/reducers/profile";
import { checkNotificationPermissions } from "../features/pushNotifications/utils";
import { PaymentsTrackingConfiguration } from "../features/payments/common/analytics";
import { getPaymentsAnalyticsConfiguration } from "../features/payments/common/store/selectors";
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
  MixpanelOptInTrackingType,
  Property,
  PropertyToUpdate,
  loginSessionConfigHandler,
  mixpanelOptInHandler,
  notificationConfigurationHandler,
  serviceConfigHandler
} from "./mixpanelPropertyUtils";

type ProfileProperties = {
  LOGIN_SESSION: LoginSessionDuration;
  LOGIN_METHOD: string;
  TOS_ACCEPTED_VERSION: number | string;
  BIOMETRIC_TECHNOLOGY: BiometricsType;
  NOTIFICATION_CONFIGURATION: NotificationPreferenceConfiguration;
  NOTIFICATION_PERMISSION: NotificationPermissionType;
  SERVICE_CONFIGURATION: ServiceConfigurationTrackingType;
  TRACKING: MixpanelOptInTrackingType;
  PAYMENTS_CONFIGURATION: PaymentsTrackingConfiguration;
  ITW_STATUS: ItwStatus;
  ITW_ID: ItwId;
  ITW_PG: ItwPg;
  ITW_TS: ItwTs;
  ITW_CED: ItwCed;
  ITW_HAS_READ_IPZS_POLICY: boolean;
};

export const updateMixpanelProfileProperties = async (
  state: GlobalState,
  forceUpdateFor?: PropertyToUpdate<ProfileProperties>
) => {
  if (!mixpanel) {
    return;
  }
  const LOGIN_SESSION = loginSessionConfigHandler(state);
  const LOGIN_METHOD = loginMethodHandler(state);
  const TOS_ACCEPTED_VERSION = tosVersionHandler(state);
  const BIOMETRIC_TECHNOLOGY = await getBiometricsType();
  const NOTIFICATION_CONFIGURATION = notificationConfigurationHandler(state);
  const notificationsEnabled = await checkNotificationPermissions();
  const SERVICE_CONFIGURATION = serviceConfigHandler(state);
  const TRACKING = mixpanelOptInHandler(state);
  const PAYMENTS_CONFIGURATION = getPaymentsAnalyticsConfiguration(state);
  const ITW_STATUS = walletStatusHandler();
  const ITW_ID = idStatusHandler(state);
  const ITW_PG = pgStatusHandler(state);
  const ITW_TS = tsStatusHandler(state);
  const ITW_CED = cedStatusHandler(state);

  const profilePropertiesObject: ProfileProperties = {
    LOGIN_SESSION,
    LOGIN_METHOD,
    TOS_ACCEPTED_VERSION,
    BIOMETRIC_TECHNOLOGY,
    NOTIFICATION_CONFIGURATION,
    NOTIFICATION_PERMISSION:
      getNotificationPermissionType(notificationsEnabled),
    SERVICE_CONFIGURATION,
    TRACKING,
    PAYMENTS_CONFIGURATION,
    ITW_HAS_READ_IPZS_POLICY: false,
    ITW_STATUS,
    ITW_ID,
    ITW_PG,
    ITW_TS,
    ITW_CED
  };

  if (forceUpdateFor) {
    forceUpdate<keyof ProfileProperties>(
      profilePropertiesObject,
      forceUpdateFor
    );
  }

  mixpanel.getPeople().set(profilePropertiesObject);
};

const forceUpdate = <T extends keyof ProfileProperties>(
  profilePropertiesObject: ProfileProperties,
  toUpdate: Property<ProfileProperties, T>
) => {
  // eslint-disable-next-line functional/immutable-data
  profilePropertiesObject[toUpdate.property] = toUpdate.value;
};

const loginMethodHandler = (state: GlobalState): string => {
  const idpSelected = idpSelector(state);
  return O.isSome(idpSelected) ? idpSelected.value.name : "not set";
};

const tosVersionHandler = (state: GlobalState): number | string => {
  const optInState = tosVersionSelector(state);
  return optInState ? optInState : "not set";
};

// TODO [SIW-1438]: Add dynamic profile properties
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
