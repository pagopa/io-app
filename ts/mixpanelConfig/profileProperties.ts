import * as O from "fp-ts/lib/Option";
import * as Sentry from "@sentry/react-native";
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
import { TrackCgnStatus } from "../features/bonus/cgn/analytics";
import {
  fontPreferenceSelector,
  themePreferenceSelector
} from "../store/reducers/persistedPreferences.ts";
import {
  booleanOrUndefinedToPNServiceStatus,
  PNServiceStatus
} from "../features/pn/analytics/index.ts";
import { isPnServiceEnabled } from "../features/pn/reminderBanner/reducer/bannerDismiss.ts";
import {
  cdcStatusHandler,
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
  CDC_STATUS: number;
  FONT_PREFERENCE: string;
  THEME_PREFERENCE: string;
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
    if (!isMixpanelInstanceInitialized()) {
      return;
    }
    const notificationsEnabled = await checkNotificationPermissions();
    const pnServiceEnabled = isPnServiceEnabled(state);

    const BIOMETRIC_TECHNOLOGY = await getBiometricsType(false);
    const CGN_STATUS = cgnStatusHandler(state);
    const CDC_STATUS = cdcStatusHandler(state);
    const FONT_PREFERENCE = fontPreferenceSelector(state);
    const THEME_PREFERENCE = themePreferenceSelector(state);
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

    const profilePropertiesObject: ProfileProperties = {
      BIOMETRIC_TECHNOLOGY,
      CGN_STATUS,
      CDC_STATUS,
      FONT_PREFERENCE,
      THEME_PREFERENCE,
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

    if (forceUpdateFor) {
      forceUpdate<keyof ProfileProperties>(
        profilePropertiesObject,
        forceUpdateFor
      );
    }

    getPeople()?.set(profilePropertiesObject);
  } catch (e) {
    Sentry.captureException(e);
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
