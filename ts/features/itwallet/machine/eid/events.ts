import { LocalIdpsFallback } from "../../../../utils/idps";

export type IdentificationMode = "spid" | "ciePin" | "cieId";

export type Start = {
  type: "start";
};

export type AcceptTos = {
  type: "accept-tos";
};

export type AddToWallet = {
  type: "add-to-wallet";
};

export type GoToWallet = {
  type: "go-to-wallet";
};

export type AddNewCredential = {
  type: "add-new-credential";
};

export type RequestAssistance = {
  type: "request-assistance";
};

export type SelectIdentificationMode = {
  type: "select-identification-mode";
  mode: IdentificationMode;
};

export type SelectSpidIdp = {
  type: "select-spid-idp";
  idp: LocalIdpsFallback;
};

export type Retry = {
  type: "retry";
};

export type Back = {
  type: "back";
};

export type Close = {
  type: "close";
};

export type EidIssuanceEvents =
  | Start
  | AcceptTos
  | SelectIdentificationMode
  | SelectSpidIdp
  | AddToWallet
  | GoToWallet
  | AddNewCredential
  | RequestAssistance
  | Retry
  | Back
  | Close;
