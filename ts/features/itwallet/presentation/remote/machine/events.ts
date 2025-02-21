import { ItwRemoteRequestPayload } from "../Utils/itwRemoteTypeUtils.ts";

export type Reset = {
  type: "reset";
};

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

export type Back = {
  type: "back";
};

export type Close = {
  type: "close";
};

export type RemoteEvents =
  | Reset
  | Start
  | GoToWalletActivation
  | GoToIdentificationMode
  | Back
  | Close;
