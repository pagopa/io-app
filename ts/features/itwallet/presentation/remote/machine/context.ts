import { ItwRemoteQRCodePayload } from "../Utils/itwRemoteTypeUtils.ts";
import { RemoteFailure } from "./failure.ts";

export type Context = {
  /**
   * The QRCode payload for the remote presentation
   */
  qrCodePayload: ItwRemoteQRCodePayload | undefined;
  /**
   * The failure of the remote presentation machine
   */
  failure?: RemoteFailure;
};

export const InitialContext: Context = {
  qrCodePayload: undefined,
  failure: undefined
};
