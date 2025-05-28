import { SelfConsentMultiDTO } from "../../../../../definitions/idpay/SelfConsentMultiDTO";
import { SelfDeclarationBoolDTO } from "../../../../../definitions/idpay/SelfDeclarationBoolDTO";
import { SelfDeclarationTextDTO } from "../../../../../definitions/idpay/SelfDeclarationTextDTO";

export type StartOnboarding = {
  readonly type: "start-onboarding";
  readonly serviceId: string;
};

export type ToggleBoolCriteria = {
  readonly type: "toggle-bool-criteria";
  readonly criteria: SelfDeclarationBoolDTO;
};

export type SelectMultiConsent = {
  readonly type: "select-multi-consent";
  readonly data: SelfConsentMultiDTO;
};

export type InputTextCriteria = {
  readonly type: "input-text-criteria";
  readonly criteria: SelfDeclarationTextDTO;
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

export type IdPayOnboardingEvents =
  | StartOnboarding
  | SelectMultiConsent
  | ToggleBoolCriteria
  | InputTextCriteria
  | Next
  | Back
  | Close;
