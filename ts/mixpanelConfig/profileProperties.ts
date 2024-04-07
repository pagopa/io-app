import * as O from "fp-ts/lib/Option";
import { mixpanel } from "../mixpanel";
import { GlobalState } from "../store/reducers/types";
import { LoginSessionDuration } from "../features/fastLogin/analytics/optinAnalytics";
import { BiometricsType, getBiometricsType } from "../utils/biometrics";
import {
  NotificationPreferenceConfiguration,
  ServiceConfigurationTrackingType
} from "../screens/profile/analytics";
import { idpSelector } from "../store/reducers/authentication";
import { tosVersionSelector } from "../store/reducers/profile";
import {
  Property,
  PropertyToUpdate,
  loginSessionConfigHandler,
  notificationConfigurationHandler,
  serviceConfigHandler
} from "./mixpanelPropertyUtils";

type ProfileProperties = {
  LOGIN_SESSION: LoginSessionDuration;
  LOGIN_METHOD: string;
  TOS_ACCEPTED_VERSION: number | string;
  BIOMETRIC_TECHNOLOGY: BiometricsType;
  NOTIFICATION_CONFIGURATION: NotificationPreferenceConfiguration;
  SERVICE_CONFIGURATION: ServiceConfigurationTrackingType;
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
  const SERVICE_CONFIGURATION = serviceConfigHandler(state);

  const profilePropertiesObject: ProfileProperties = {
    LOGIN_SESSION,
    LOGIN_METHOD,
    TOS_ACCEPTED_VERSION,
    BIOMETRIC_TECHNOLOGY,
    NOTIFICATION_CONFIGURATION,
    SERVICE_CONFIGURATION
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
