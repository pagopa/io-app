import { SelfConsentBoolDTO } from "../../../../../definitions/idpay/SelfConsentBoolDTO";
import { SelfConsentMultiDTO } from "../../../../../definitions/idpay/SelfConsentMultiDTO";
import { SelfConsentMultiTypeDTO } from "../../../../../definitions/idpay/SelfConsentMultiTypeDTO";
import { SelfConsentTextDTO } from "../../../../../definitions/idpay/SelfConsentTextDTO";

export type IdPayOnboardingEvents =
  | Back
  | CheckDetails
  | Close
  | InputTextCriteria
  | Next
  | RetryConnectionEvent
  | SelectMultiConsent
  | StartOnboarding
  | ToggleBoolCriteria
  | UpdatePushNotificationSetting;

type Back = {
  readonly type: "back";
};

type CheckDetails = {
  readonly type: "check-details";
};

type Close = {
  readonly type: "close";
};

type InputTextCriteria = {
  readonly criteria: SelfConsentTextDTO;
  readonly type: "input-text-criteria";
};

type Next = {
  readonly type: "next";
};

type RetryConnectionEvent = {
  readonly type: "retryConnection";
};

type SelectMultiConsent = {
  readonly data: SelfConsentMultiDTO | SelfConsentMultiTypeDTO;
  readonly type: "select-multi-consent";
};

type StartOnboarding = {
  readonly hasInbox: boolean;
  readonly serviceId: string;
  readonly type: "start-onboarding";
};

type ToggleBoolCriteria = {
  readonly criteria: SelfConsentBoolDTO;
  readonly type: "toggle-bool-criteria";
};

type UpdatePushNotificationSetting = {
  readonly isPushNotificationEnabled: boolean;
  readonly type: "update-notification-status";
};
