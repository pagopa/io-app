import { SelfConsentMultiDTO } from "../../../../../definitions/idpay/SelfConsentMultiDTO";
import { SelfDeclarationBoolDTO } from "../../../../../definitions/idpay/SelfDeclarationBoolDTO";
import { GlobalEvents } from "../../../../xstate/types/events";
import * as Input from "./input";

export interface AutoInit {
  readonly type: "xstate.init";
  readonly input: Input.Input;
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
  | AutoInit
  | SelectMultiConsent
  | ToggleBoolCriteria
  | GlobalEvents;
