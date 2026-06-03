import { ISO18013_5 } from "@pagopa/io-react-native-iso18013";
import { CredentialMetadata } from "../../../common/utils/itwTypesUtils";
import type { ProximityDetails, VerifierRequest } from "../utils/types";
import { ProximityFailure } from "./failure";

export type Context = {
  /**
   * The credentials available in the wallet, to be potentially shared with the Relying Party.
   */
  credentials: Record<string, CredentialMetadata> | undefined;
  /**
   * The string used to generate the QR Code
   */
  qrCodeString?: string;
  /**
   * The engagement mode committed to for the current proximity session.
   * Defaults to "qrcode"; promoted to "nfc" only after the NFC permission gate succeeds.
   */
  engagementMode: ISO18013_5.EngagementMode;
  /**
   * The retrieval mode used for the proximity presentation, either "nfc" or "ble".
   */
  retrievalMethod?: ISO18013_5.RetrievalMethod;
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
  /**
   * A boolean value indicating whether the user has granted consent
   * to share their credentials with the Relying Party
   */
  hasGrantedConsent?: boolean;
};

export const InitialContext: Context = {
  credentials: undefined,
  engagementMode: "qrcode",
  failure: undefined,
  proximityDetails: undefined,
  verifierRequest: undefined
};
