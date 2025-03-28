import { Credential } from "@pagopa/io-react-native-wallet";
import {
  ItwRemoteRequestPayload,
  PresentationDetails,
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
  rpSubject: string | undefined;
  rpConf: RelyingPartyConfiguration | undefined;
  /**
   * The Request Object fetched from the Relying Party with the presentation details
   */
  requestObject: Credential.Presentation.RequestObject | undefined;
  /**
   * Details of the presentation requested by the Relying Party
   * It includes the requested claims and credentials
   */
  presentationDetails: PresentationDetails | undefined;
};

export const InitialContext: Context = {
  payload: undefined,
  failure: undefined,
  rpSubject: undefined,
  rpConf: undefined,
  requestObject: undefined,
  presentationDetails: undefined
};
