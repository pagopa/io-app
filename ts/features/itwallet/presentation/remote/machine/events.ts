import type { DoneActorEvent } from "xstate";
import { ItwRemoteRequestPayload } from "../utils/itwRemoteTypeUtils.ts";

export type Start = {
  type: "start";
  payload: ItwRemoteRequestPayload;
};

export type GoToWalletActivation = {
  type: "go-to-wallet-activation";
};

export type GoToIdentificationMode = {
  type: "go-to-identification-mode";
};

export type GoToBarcodeScan = {
  type: "go-to-barcode-scan";
};

export type Back = {
  type: "back";
};

export type Close = {
  type: "close";
};

export type ToggleCredential = {
  type: "toggle-credential";
  credentialIds: Array<string>;
};

export type Consent = {
  type: "holder-consent";
};

export type Reset = {
  type: "reset";
};

export type RemoteEvents =
  | Start
  | GoToWalletActivation
  | GoToIdentificationMode
  | GoToBarcodeScan
  | Consent
  | ToggleCredential
  | Back
  | Close
  | Reset
  | DoneActorEvent;
