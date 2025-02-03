import { ItwRemoteRequestPayload } from "../Utils/itwRemoteTypeUtils.ts";

export type Start = {
  type: "start";
  remoteRequestPayload: ItwRemoteRequestPayload;
};

export type Back = {
  type: "back";
};

export type RemoteEvents = Start | Back;
