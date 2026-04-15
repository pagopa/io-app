import { SelfConsentBoolDTO } from "../../../../../definitions/idpay/SelfConsentBoolDTO";
import { SelfConsentMultiDTO } from "../../../../../definitions/idpay/SelfConsentMultiDTO";
import { SelfConsentMultiTypeDTO } from "../../../../../definitions/idpay/SelfConsentMultiTypeDTO";
import { SelfConsentTextDTO } from "../../../../../definitions/idpay/SelfConsentTextDTO";

type StartOnboarding = {
  readonly type: "start-onboarding";
  readonly serviceId: string;
  readonly hasInbox: boolean;
};

type ToggleBoolCriteria = {
  readonly type: "toggle-bool-criteria";
  readonly criteria: SelfConsentBoolDTO;
};

type SelectMultiConsent = {
  readonly type: "select-multi-consent";
  readonly data: SelfConsentMultiDTO | SelfConsentMultiTypeDTO;
};

type InputTextCriteria = {
  readonly type: "input-text-criteria";
  readonly criteria: SelfConsentTextDTO;
};

type Next = {
  readonly type: "next";
};

type Back = {
  readonly type: "back";
};

type Close = {
  readonly type: "close";
};

type UpdatePushNotificationSetting = {
  readonly type: "update-notification-status";
  readonly isPushNotificationEnabled: boolean;
};

type CheckDetails = {
  readonly type: "check-details";
};

type RetryConnectionEvent = {
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
