import { type VerifierRequest } from "@pagopa/io-react-native-proximity";
import { ProximityDetails } from "../utils/itwProximityTypeUtils";
import { ProximityFailure } from "./failure";

export type Context = {
  /**
   * The string used to generate the QR Code
   */
  qrCodeString?: string;
  /**
   * A boolean value indicating whether an error occurs
   * during the `qrCodeString` generation process
   */
  isQRCodeGenerationError?: boolean;
  /**
   * The failure of the proximity presentation machine
   */
  failure?: ProximityFailure;
  /**
   * The Verifier Request returned from the Relying Party
   */
  verifierRequest?: VerifierRequest;
  /**
   * The details of the proximity presentation containing the localized claims grouped by credential type
   */
  proximityDetails?: ProximityDetails;
};

export const InitialContext: Context = {
  failure: undefined,
  verifierRequest: undefined,
  proximityDetails: undefined
};
