import { ItwRemoteRequestPayload } from "../Utils/itwRemoteTypeUtils.ts";
import { RemoteFailure } from "./failure.ts";

export type Context = {
  /**
   * The remote request payload for the remote presentation
   */
  remoteRequestPayload: ItwRemoteRequestPayload | undefined;
  /**
   * The failure of the remote presentation machine
   */
  failure?: RemoteFailure;
};

export const InitialContext: Context = {
  remoteRequestPayload: undefined,
  failure: undefined
};
