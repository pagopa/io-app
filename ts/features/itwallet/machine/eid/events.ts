import { ErrorActorEvent } from "xstate5";
import { LocalIdpsFallback } from "../../../../utils/idps";

export type IdentificationMode = "spid" | "ciePin" | "cieId";

export type Reset = {
  type: "reset";
};

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

export type SelectIdentificationMode = {
  type: "select-identification-mode";
  mode: IdentificationMode;
};

export type SelectSpidIdp = {
  type: "select-spid-idp";
  idp: LocalIdpsFallback;
};

export type CiePinEntered = {
  type: "cie-pin-entered";
  pin: string;
  isNfcEnabled: boolean;
};

export type CieIdentificationCompleted = {
  type: "cie-identification-completed";
  url: string;
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

export type NfcEnabled = {
  type: "nfc-enabled";
};

export type EidIssuanceEvents =
  | Reset
  | Start
  | AcceptTos
  | SelectIdentificationMode
  | SelectSpidIdp
  | CiePinEntered
  | CieIdentificationCompleted
  | AddToWallet
  | GoToWallet
  | AddNewCredential
  | Retry
  | Back
  | Close
  | NfcEnabled
  | ErrorActorEvent;
