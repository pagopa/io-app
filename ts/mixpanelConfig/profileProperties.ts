import * as O from "fp-ts/lib/Option";
import { getPeople, isMixpanelInstanceInitialized } from "../mixpanel.ts";
import { GlobalState } from "../store/reducers/types";
import { LoginSessionDuration } from "../features/authentication/fastLogin/analytics/optinAnalytics";
import { BiometricsType, getBiometricsType } from "../utils/biometrics";
import {
  getNotificationPermissionType,
  getNotificationTokenType,
  NotificationPermissionType,
  NotificationPreferenceConfiguration,
  NotificationTokenType,
  ServiceConfigurationTrackingType
} from "../features/settings/common/analytics/index.ts";
import { idpSelector } from "../features/authentication/common/store/selectors";
import { tosVersionSelector } from "../features/settings/common/store/selectors/index.ts";
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
import { sendExceptionToSentry } from "../utils/sentryUtils.ts";
import {
  booleanOrUndefinedToPNServiceStatus,
  PNServiceStatus
} from "../features/pn/analytics/index.ts";
import { isPnServiceEnabled } from "../features/pn/reminderBanner/reducer/bannerDismiss.ts";
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
  BIOMETRIC_TECHNOLOGY: BiometricsType;
  CGN_STATUS: TrackCgnStatus;
  FONT_PREFERENCE: string;
  ITW_CED_V2: ItwCed;
  ITW_ID_V2: ItwId;
  ITW_PG_V2: ItwPg;
  ITW_STATUS_V2: ItwStatus;
  ITW_TS_V2: ItwTs;
  LOGIN_METHOD: string;
  LOGIN_SESSION: LoginSessionDuration;
  NOTIFICATION_CONFIGURATION: NotificationPreferenceConfiguration;
  NOTIFICATION_PERMISSION: NotificationPermissionType;
  NOTIFICATION_TOKEN: NotificationTokenType;
  SAVED_PAYMENT_METHOD: number;
  SEND_STATUS: PNServiceStatus;
  SERVICE_CONFIGURATION: ServiceConfigurationTrackingType;
  TOS_ACCEPTED_VERSION: number | string;
  TRACKING: MixpanelOptInTrackingType;
  WELFARE_STATUS: ReadonlyArray<string>;
};

export const updateMixpanelProfileProperties = async (
  state: GlobalState,
  forceUpdateFor?: PropertyToUpdate<ProfileProperties>
) => {
  try {
    console.log(`=== 000`);
    if (!isMixpanelInstanceInitialized()) {
      console.log(`=== 000a`);
      return;
    }
    console.log(`=== 001`);
    const notificationsEnabled = await checkNotificationPermissions();
    console.log(`=== 001a`);
    const pnServiceEnabled = isPnServiceEnabled(state);
    console.log(`=== 001b`);
    const BIOMETRIC_TECHNOLOGY = await getBiometricsType();
    const CGN_STATUS = cgnStatusHandler(state);
    const FONT_PREFERENCE = fontPreferenceSelector(state);
    const ITW_CED_V2 = cedStatusHandler(state);
    const ITW_ID_V2 = idStatusHandler(state);
    const ITW_PG_V2 = pgStatusHandler(state);
    const ITW_STATUS_V2 = walletStatusHandler(state);
    const ITW_TS_V2 = tsStatusHandler(state);
    const LOGIN_METHOD = loginMethodHandler(state);
    const LOGIN_SESSION = loginSessionConfigHandler(state);
    const NOTIFICATION_CONFIGURATION = notificationConfigurationHandler(state);
    const NOTIFICATION_PERMISSION =
      getNotificationPermissionType(notificationsEnabled);
    const NOTIFICATION_TOKEN = getNotificationTokenType(state);
    const SAVED_PAYMENT_METHOD = paymentMethodsHandler(state);
    const SEND_STATUS = booleanOrUndefinedToPNServiceStatus(pnServiceEnabled);
    const SERVICE_CONFIGURATION = serviceConfigHandler(state);
    const TOS_ACCEPTED_VERSION = tosVersionHandler(state);
    const TRACKING = mixpanelOptInHandler(state);
    const WELFARE_STATUS = welfareStatusHandler(state);
    console.log(`=== 002`);
    const profilePropertiesObject: ProfileProperties = {
      BIOMETRIC_TECHNOLOGY,
      CGN_STATUS,
      FONT_PREFERENCE,
      ITW_CED_V2,
      ITW_ID_V2,
      ITW_PG_V2,
      ITW_STATUS_V2,
      ITW_TS_V2,
      LOGIN_METHOD,
      LOGIN_SESSION,
      NOTIFICATION_CONFIGURATION,
      NOTIFICATION_PERMISSION,
      NOTIFICATION_TOKEN,
      SAVED_PAYMENT_METHOD,
      SEND_STATUS,
      SERVICE_CONFIGURATION,
      TOS_ACCEPTED_VERSION,
      TRACKING,
      WELFARE_STATUS
    };
    console.log(`=== 003`);
    if (forceUpdateFor) {
      forceUpdate<keyof ProfileProperties>(
        profilePropertiesObject,
        forceUpdateFor
      );
    }
    console.log(`=== 004`);
    getPeople()?.set(profilePropertiesObject);
  } catch (e) {
    console.log(`=== EXCEPTION ${e}`);
    sendExceptionToSentry(e, "updateMixpanelProfileProperties");
  }
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
