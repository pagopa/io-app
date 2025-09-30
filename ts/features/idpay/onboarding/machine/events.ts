import { SelfConsentBoolDTO } from "../../../../../definitions/idpay/SelfConsentBoolDTO";
import { SelfConsentMultiDTO } from "../../../../../definitions/idpay/SelfConsentMultiDTO";
import { SelfConsentMultiTypeDTO } from "../../../../../definitions/idpay/SelfConsentMultiTypeDTO";
import { SelfConsentTextDTO } from "../../../../../definitions/idpay/SelfConsentTextDTO";

export type StartOnboarding = {
  readonly type: "start-onboarding";
  readonly serviceId: string;
  readonly hasInbox: boolean;
};

export type ToggleBoolCriteria = {
  readonly type: "toggle-bool-criteria";
  readonly criteria: SelfConsentBoolDTO;
};

export type SelectMultiConsent = {
  readonly type: "select-multi-consent";
  readonly data: SelfConsentMultiDTO | SelfConsentMultiTypeDTO;
};

export type InputTextCriteria = {
  readonly type: "input-text-criteria";
  readonly criteria: SelfConsentTextDTO;
};

export type Next = {
  readonly type: "next";
};

export type Back = {
  readonly type: "back";
};

export type Close = {
  readonly type: "close";
};

export type UpdatePushNotificationSetting = {
  readonly type: "update-notification-status";
  readonly isPushNotificationEnabled: boolean;
};

export type CheckDetails = {
  readonly type: "check-details";
};

export type RetryConnectionEvent = {
  readonly type: "retryConnection";
};

export type IdPayOnboardingEvents =
  | StartOnboarding
  | SelectMultiConsent
  | ToggleBoolCriteria
  | InputTextCriteria
  | Next
  | Back
  | Close
  | UpdatePushNotificationSetting
  | CheckDetails
  | RetryConnectionEvent;
