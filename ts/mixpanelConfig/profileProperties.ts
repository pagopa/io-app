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
import {
  getMixpanelCredentialStatus,
  getPIDMixpanelStatus,
  ItwCredentialMixpanelStatus,
  ItwPIDStatus,
  ItwStatus
} from "../features/itwallet/analytics";
import { TrackCgnStatus } from "../features/bonus/cgn/analytics";
import { itwAuthLevelSelector } from "../features/itwallet/common/store/selectors/preferences.ts";
import {
  fontPreferenceSelector,
  themePreferenceSelector
} from "../store/reducers/persistedPreferences.ts";
import {
  booleanOrUndefinedToPNServiceStatus,
  PNServiceStatus
} from "../features/pn/analytics/index.ts";
import { isPnServiceEnabled } from "../features/pn/reminderBanner/reducer/bannerDismiss.ts";
import { itwLifecycleIsITWalletValidSelector } from "../features/itwallet/lifecycle/store/selectors";
import { CredentialType } from "../features/itwallet/common/utils/itwMocksUtils";
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
  ITW_STATUS_V2: ItwStatus;
  ITW_ID_V2?: ItwPIDStatus;
  ITW_PID: ItwPIDStatus;
  ITW_PG_V2?: ItwCredentialMixpanelStatus;
  ITW_TS_V2?: ItwCredentialMixpanelStatus;
  ITW_CED_V2?: ItwCredentialMixpanelStatus;
  ITW_PG_V3: ItwCredentialMixpanelStatus;
  ITW_TS_V3: ItwCredentialMixpanelStatus;
  ITW_CED_V3: ItwCredentialMixpanelStatus;
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

    const BIOMETRIC_TECHNOLOGY = await getBiometricsType();
    const CGN_STATUS = cgnStatusHandler(state);
    const CDC_STATUS = cdcStatusHandler(state);
    const FONT_PREFERENCE = fontPreferenceSelector(state);
    const THEME_PREFERENCE = themePreferenceSelector(state);
    const ITW_STATUS_V2 = walletStatusHandler(state);
    const ITW_PID = getPIDMixpanelStatus(state, true);
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

    const isItwL3 = itwLifecycleIsITWalletValidSelector(state);
    const ITW_PG_V3 = await getMixpanelCredentialStatus(
      CredentialType.DRIVING_LICENSE,
      state,
      isItwL3
    );
    const ITW_TS_V3 = await getMixpanelCredentialStatus(
      CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD,
      state,
      isItwL3
    );
    const ITW_CED_V3 = await getMixpanelCredentialStatus(
      CredentialType.EUROPEAN_DISABILITY_CARD,
      state,
      isItwL3
    );

    const profilePropertiesObject: ProfileProperties = {
      BIOMETRIC_TECHNOLOGY,
      CGN_STATUS,
      CDC_STATUS,
      FONT_PREFERENCE,
      THEME_PREFERENCE,
      ITW_STATUS_V2,
      ...(!isItwL3 && {
        ITW_ID_V2: getPIDMixpanelStatus(state, false),
        ITW_PG_V2: await getMixpanelCredentialStatus(
          CredentialType.DRIVING_LICENSE,
          state
        ),
        ITW_TS_V2: await getMixpanelCredentialStatus(
          CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD,
          state
        ),
        ITW_CED_V2: await getMixpanelCredentialStatus(
          CredentialType.EUROPEAN_DISABILITY_CARD,
          state
        )
      }),
      ITW_PID,
      ITW_PG_V3,
      ITW_CED_V3,
      ITW_TS_V3,
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

const walletStatusHandler = (state: GlobalState): ItwStatus => {
  const authLevel = itwAuthLevelSelector(state);
  return authLevel ?? "not_active";
};
