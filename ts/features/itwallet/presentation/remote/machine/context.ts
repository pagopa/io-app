import { RequestObject } from "../../../common/utils/itwTypesUtils";
import {
  EnrichedPresentationDetails,
  ItwRemoteRequestPayload,
  RelyingPartyConfiguration
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
  /**
   * Relying party Entity Configuration subject
   */
  rpSubject: string | undefined;
  /**
   * Relying party Entity Configuration metadata
   */
  rpConf: RelyingPartyConfiguration | undefined;
  /**
   * The Encoded Request Object fetched from the Relying Party in the authorization request
   */
  requestObjectEncodedJwt: string | undefined;
  /**
   * The Request Object fetched from the Relying Party with the presentation details
   */
  requestObject: RequestObject | undefined;
  /**
   * Details of the presentation requested by the Relying Party
   * It includes the requested claims and credentials
   */
  presentationDetails: EnrichedPresentationDetails | undefined;
  /**
   * Optional credentials selected by the user, identified by their presentation ID
   */
  selectedOptionalCredentials: Set<string>;
  /**
   * The URI to redirect the user to access the Relying Party's service
   * It is not required in cross-device presentation
   */
  redirectUri?: string;
};

export const InitialContext: Context = {
  payload: undefined,
  failure: undefined,
  rpSubject: undefined,
  rpConf: undefined,
  requestObjectEncodedJwt: undefined,
  requestObject: undefined,
  presentationDetails: undefined,
  selectedOptionalCredentials: new Set()
};
