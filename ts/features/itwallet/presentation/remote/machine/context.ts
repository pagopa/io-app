import {
  EnrichedPresentationDetails,
  ItwRemoteRequestPayload,
  RelyingPartyConfiguration,
  RequestObject
} from "../utils/itwRemoteTypeUtils";
import { RemoteFailure } from "./failure";

export type Context = {
  /**
   * The remote request payload for the remote presentation
   */
  payload: ItwRemoteRequestPayload | undefined;
  /**
   * The failure of the remote presentation machine
   */
  failure?: RemoteFailure;
  rpSubject: string | undefined;
  rpConf: RelyingPartyConfiguration | undefined;
  /**
   * The Request Object fetched from the Relying Party with the presentation details
   */
  requestObject: RequestObject | undefined;
  /**
   * Details of the presentation requested by the Relying Party
   * It includes the requested claims and credentials
   */
  presentationDetails: EnrichedPresentationDetails | undefined;
};

export const InitialContext: Context = {
  payload: undefined,
  failure: undefined,
  rpSubject: undefined,
  rpConf: undefined,
  requestObject: undefined,
  presentationDetails: undefined
};
