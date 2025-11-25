import * as pot from "@pagopa/ts-commons/lib/pot";
import { createSelector } from "reselect";
import { ServicesPreferencesModeEnum } from "../../definitions/backend/ServicesPreferencesMode";
import { TrackCgnStatus } from "../features/bonus/cgn/analytics";
import { LoginSessionDuration } from "../features/authentication/fastLogin/analytics/optinAnalytics";
import { fastLoginOptInSelector } from "../features/authentication/fastLogin/store/selectors";
import {
  selectWalletCardsByType,
  selectWalletPlaceholderCards
} from "../features/wallet/store/selectors";
import { paymentsWalletUserMethodsSelector } from "../features/payments/wallet/store/selectors";
import {
  NotificationPreferenceConfiguration,
  ServiceConfigurationTrackingType,
  getNotificationPreferenceConfiguration
} from "../features/settings/common/analytics";
import {
  profileNotificationSettingsSelector,
  profileServicePreferencesModeSelector
} from "../features/settings/common/store/selectors";
import { GlobalState } from "../store/reducers/types";
import { isMixpanelEnabled } from "./../store/reducers/persistedPreferences";

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

export type MixpanelOptInTrackingType = "accepted" | "declined" | "not set";
export const mixpanelOptInHandler = (
  state: GlobalState
): MixpanelOptInTrackingType => {
  const isMixpanelEnabledResult = isMixpanelEnabled(state);
  return isMixpanelEnabledResult === undefined
    ? "not set"
    : isMixpanelEnabledResult
    ? "accepted"
    : "declined";
};

export const paymentsWalletUserMethodsNumberFromPotSelector = createSelector(
  paymentsWalletUserMethodsSelector,
  walletPot => pot.getOrElse(walletPot, undefined)
);

export const paymentMethodsHandler = (state: GlobalState): number => {
  const placeholderCards = selectWalletPlaceholderCards(state);
  return (
    placeholderCards?.filter(card => card.category === "payment")?.length ?? 0
  );
};

export const cgnStatusHandler = (state: GlobalState): TrackCgnStatus => {
  const cgnCard = selectWalletCardsByType(state, "cgn");
  return cgnCard.length > 0 ? "active" : "not_active";
};

export const welfareStatusHandler = (
  state: GlobalState
): ReadonlyArray<string> => {
  const idPayCards = selectWalletCardsByType(state, "idPay");
  return idPayCards.map(card => card.name);
};

export const cdcStatusHandler = (state: GlobalState): number => {
  const cdcCards = selectWalletCardsByType(state, "cdc");
  return cdcCards.reduce((sum, card) => sum + card.numberOfCards, 0);
};
