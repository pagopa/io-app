import { CredentialType } from "../../common/utils/itwMocksUtils";

export type Start = {
  type: "start";
  credentialType: CredentialType;
};

export type AcceptTos = {
  type: "accept-tos";
};

export type SelectIdentificationMode = {
  type: "select-identification-mode";
  mode: number;
};

export type AddToWallet = {
  type: "add-to-wallet";
};

export type ConfirmIdentity = {
  type: "confirm-identity";
};

export type GoToWallet = {
  type: "go-to-wallet";
};

export type RequestAssistance = {
  type: "request-assistance";
};

export type Next = {
  type: "next";
};

export type Close = {
  type: "close";
};

export type Events =
  | Start
  | AcceptTos
  | SelectIdentificationMode
  | AddToWallet
  | ConfirmIdentity
  | GoToWallet
  | RequestAssistance
  | Next
  | Close;
