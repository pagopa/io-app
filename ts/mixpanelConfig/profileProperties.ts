import * as O from "fp-ts/lib/Option";
import { mixpanel } from "../mixpanel";
import { GlobalState } from "../store/reducers/types";
import { LoginSessionDuration } from "../features/fastLogin/analytics/optinAnalytics";
import { BiometricsType, getBiometricsType } from "../utils/biometrics";
import {
  getNotificationPermissionType,
  NotificationPermissionType,
  NotificationPreferenceConfiguration,
  ServiceConfigurationTrackingType
} from "../screens/profile/analytics";
import { idpSelector } from "../store/reducers/authentication";
import { tosVersionSelector } from "../store/reducers/profile";
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
import { fontPreferenceSelector } from "../store/reducers/persistedPreferences.ts";
import {
  cgnStatusHandler,
  loginSessionConfigHandler,
  mixpanelOptInHandler,
  MixpanelOptInTrackingType,
  notificationConfigurationHandler,
  paymentMethodsHandler,
  Property,
  PropertyToUpdate,
  serviceConfigHandler,
  welfareStatusHandler
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
  ITW_STATUS_V2: ItwStatus;
  ITW_ID_V2: ItwId;
  ITW_PG_V2: ItwPg;
  ITW_TS_V2: ItwTs;
  ITW_CED_V2: ItwCed;
  SAVED_PAYMENT_METHOD?: number;
  CGN_STATUS: TrackCgnStatus;
  WELFARE_STATUS: ReadonlyArray<string>;
  FONT_PREFERENCE: string;
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
  const ITW_STATUS_V2 = walletStatusHandler(state);
  const ITW_ID_V2 = idStatusHandler(state);
  const ITW_PG_V2 = pgStatusHandler(state);
  const ITW_TS_V2 = tsStatusHandler(state);
  const ITW_CED_V2 = cedStatusHandler(state);
  const SAVED_PAYMENT_METHOD = paymentMethodsHandler(state);
  const CGN_STATUS = cgnStatusHandler(state);
  const WELFARE_STATUS = welfareStatusHandler(state);
  const FONT_PREFERENCE = fontPreferenceSelector(state);

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
    ITW_STATUS_V2,
    ITW_ID_V2,
    ITW_PG_V2,
    ITW_TS_V2,
    ITW_CED_V2,
    SAVED_PAYMENT_METHOD,
    CGN_STATUS,
    WELFARE_STATUS,
    FONT_PREFERENCE
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

const walletStatusHandler = (state: GlobalState): ItwStatus => {
  const authLevel = itwAuthLevelSelector(state);
  return authLevel ?? "not_active";
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
