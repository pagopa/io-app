import { SelfConsentMultiDTO } from "../../../../../definitions/idpay/SelfConsentMultiDTO";
import { SelfDeclarationBoolDTO } from "../../../../../definitions/idpay/SelfDeclarationBoolDTO";
import { E_BACK } from "../../common/xstate/events";

// Events types
type E_SELECT_INITIATIVE = {
  type: "SELECT_INITIATIVE";
  serviceId: string;
};

type E_ACCEPT_TOS = {
  type: "ACCEPT_TOS";
};

type E_ACCEPT_REQUIRED_PDND_CRITERIA = {
  type: "ACCEPT_REQUIRED_PDND_CRITERIA";
};

type E_TOGGLE_BOOL_CRITERIA = {
  type: "TOGGLE_BOOL_CRITERIA";
  criteria: SelfDeclarationBoolDTO;
};

type E_ACCEPT_REQUIRED_BOOL_CRITERIA = {
  type: "ACCEPT_REQUIRED_BOOL_CRITERIA";
};

type E_QUIT_ONBOARDING = {
  type: "QUIT_ONBOARDING";
};

type E_SHOW_INITIATIVE_DETAILS = {
  type: "SHOW_INITIATIVE_DETAILS";
};

type E_SELECT_MULTI_CONSENT = {
  type: "SELECT_MULTI_CONSENT";
  data: SelfConsentMultiDTO;
};

export type Events =
  | E_SELECT_INITIATIVE
  | E_ACCEPT_TOS
  | E_ACCEPT_REQUIRED_PDND_CRITERIA
  | E_QUIT_ONBOARDING
  | E_SHOW_INITIATIVE_DETAILS
  | E_BACK
  | E_SELECT_MULTI_CONSENT
  | E_TOGGLE_BOOL_CRITERIA
  | E_ACCEPT_REQUIRED_BOOL_CRITERIA;
