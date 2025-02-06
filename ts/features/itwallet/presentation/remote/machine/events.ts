import { ItwRemoteRequestPayload } from "../Utils/itwRemoteTypeUtils.ts";

export type Reset = {
  type: "reset";
};

export type Start = {
  type: "start";
  payload: ItwRemoteRequestPayload;
};

export type AcceptTos = {
  type: "accept-tos";
};

export type GoToWallet = {
  type: "go-to-wallet";
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
  | AcceptTos
  | GoToWallet
  | Back
  | Close;
