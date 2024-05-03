import { SelfConsentMultiDTO } from "../../../../../definitions/idpay/SelfConsentMultiDTO";
import { SelfDeclarationBoolDTO } from "../../../../../definitions/idpay/SelfDeclarationBoolDTO";
import { GlobalEvents } from "../../../../xstate/types/events";

export interface StartOnboarding {
  readonly type: "start-onboarding";
  readonly serviceId: string;
}

export interface ToggleBoolCriteria {
  readonly type: "toggle-bool-criteria";
  readonly criteria: SelfDeclarationBoolDTO;
}

export interface SelectMultiConsent {
  readonly type: "select-multi-consent";
  readonly data: SelfConsentMultiDTO;
}

export type Events =
  | GlobalEvents
  | StartOnboarding
  | SelectMultiConsent
  | ToggleBoolCriteria;
