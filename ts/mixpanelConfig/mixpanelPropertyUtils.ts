import { LoginSessionDuration } from "../features/fastLogin/analytics/optinAnalytics";
import {
  NotificationPreferenceConfiguration,
  ServiceConfigurationTrackingType,
  getNotificationPreferenceConfiguration
} from "../screens/profile/analytics";
import { GlobalState } from "../store/reducers/types";
import {
  profileNotificationSettingsSelector,
  profileServicePreferencesModeSelector
} from "../store/reducers/profile";
import { fastLoginOptInSelector } from "../features/fastLogin/store/selectors";
import { ServicesPreferencesModeEnum } from "../../definitions/backend/ServicesPreferencesMode";

export type Property<K, T extends keyof K> = {
  property: T;
  value: K[T];
};

export type PropertyToUpdate<K> = {
  [T in keyof K]: Property<K, T>;
}[keyof K];

export const loginSessionConfigHandler = (
  state: GlobalState
): LoginSessionDuration => {
  const optInState = fastLoginOptInSelector(state).enabled;
  switch (optInState) {
    case undefined:
      return "not set";
    case true:
      return "365";
    case false:
      return "30";
  }
};

export const notificationConfigurationHandler = (
  state: GlobalState
): NotificationPreferenceConfiguration => {
  const notificationConfigurationState =
    profileNotificationSettingsSelector(state);

  return getNotificationPreferenceConfiguration(
    notificationConfigurationState?.reminder,
    notificationConfigurationState?.preview
  );
};

export const serviceConfigHandler = (
  state: GlobalState
): ServiceConfigurationTrackingType => {
  const serviceConfigState = profileServicePreferencesModeSelector(state);
  if (
    !serviceConfigState ||
    serviceConfigState === ServicesPreferencesModeEnum.LEGACY
  ) {
    return "not set";
  }
  return serviceConfigState;
};
