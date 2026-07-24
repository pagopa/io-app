import type { DoneActorEvent } from "xstate";

import {
  ItwRemoteFlowType,
  ItwRemoteRequestPayload
} from "../utils/itwRemoteTypeUtils.ts";

export type Back = {
  type: "back";
};

export type Close = {
  type: "close";
};

export type Consent = {
  type: "holder-consent";
};

export type GoToBarcodeScan = {
  type: "go-to-barcode-scan";
};

export type GoToIdentificationMode = {
  type: "go-to-identification-mode";
};

export type GoToWalletActivation = {
  type: "go-to-wallet-activation";
};

export type RemoteEvents =
  | Back
  | Close
  | Consent
  | DoneActorEvent
  | GoToBarcodeScan
  | GoToIdentificationMode
  | GoToWalletActivation
  | Reset
  | Start
  | ToggleCredential;

export type Reset = {
  type: "reset";
};

export type Start = {
  flowType: ItwRemoteFlowType;
  payload: ItwRemoteRequestPayload;
  type: "start";
};

export type ToggleCredential = {
  credentialIds: Array<string>;
  type: "toggle-credential";
};
