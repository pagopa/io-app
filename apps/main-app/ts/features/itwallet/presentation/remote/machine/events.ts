import type { DoneActorEvent } from "xstate";

import {
  ItwRemoteFlowType,
  ItwRemoteRequestPayload
} from "../utils/itwRemoteTypeUtils.ts";

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

type Back = {
  type: "back";
};

type Close = {
  type: "close";
};

type Consent = {
  type: "holder-consent";
};

type GoToBarcodeScan = {
  type: "go-to-barcode-scan";
};

type GoToIdentificationMode = {
  type: "go-to-identification-mode";
};

type GoToWalletActivation = {
  type: "go-to-wallet-activation";
};

type Reset = {
  type: "reset";
};

type Start = {
  flowType: ItwRemoteFlowType;
  payload: ItwRemoteRequestPayload;
  type: "start";
};

type ToggleCredential = {
  credentialIds: Array<string>;
  type: "toggle-credential";
};
