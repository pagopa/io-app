import type {
  ProximityDetails,
  VerifierRequest
} from "../utils/itwProximityTypeUtils";

import { ProximityFailure } from "./failure";

export type Context = {
  /**
   * The type of credential to be presented
   */
  credentialType: string | undefined;
  /**
   * The failure of the proximity presentation machine
   */
  failure?: ProximityFailure;
  /**
   * A boolean value indicating whether the user has given consent
   * to share their credentials with the Relying Party
   */
  hasGivenConsent?: boolean;
  /**
   * A boolean value indicating whether an error occurs
   * during the `qrCodeString` generation process
   */
  isQRCodeGenerationError?: boolean;
  /**
   * The details of the proximity presentation containing the localized claims grouped by credential type
   */
  proximityDetails?: ProximityDetails;
  /**
   * The string used to generate the QR Code
   */
  qrCodeString?: string;
  /**
   * The Verifier Request returned from the Relying Party
   */
  verifierRequest?: VerifierRequest;
};

export const InitialContext: Context = {
  credentialType: undefined,
  failure: undefined,
  proximityDetails: undefined,
  verifierRequest: undefined
};
