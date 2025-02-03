import { ItwRemoteQRCodePayload } from "../Utils/itwRemoteTypeUtils";

export type Start = {
  type: "start";
  qrCodePayload: ItwRemoteQRCodePayload;
};

export type Back = {
  type: "back";
};

export type RemoteEvents = Start | Back;
