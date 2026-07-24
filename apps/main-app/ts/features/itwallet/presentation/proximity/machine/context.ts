import { ISO18013_5 } from "@pagopa/io-react-native-iso18013";

import type { ProximityDetails, VerifierRequest } from "../utils/types";

import { CredentialMetadata } from "../../../common/utils/itwTypesUtils";
import { ProximityFailure } from "./failure";

export type Context = {
  /**
   * The credentials available in the wallet, to be potentially shared with the Relying Party.
   */
  credentials: Record<string, CredentialMetadata> | undefined;
  /**
   * The engagement mode committed to for the current proximity session.
   * Defaults to "qrcode"; promoted to "nfc" only after the NFC permission gate succeeds.
   */
  engagementMode: ISO18013_5.EngagementMode;
  /**
   * The failure of the proximity presentation machine
   */
  failure?: ProximityFailure;
  /**
   * The deterministic consent key for the exact proximity details the user
   * reviewed and approved in the current session. Used to skip re-consent for
   * NFC retrieval when the verifier re-issues the same request.
   * Derived via generateConsentKey(getConsentDataFromProximityDetails(proximityDetails)).
   */
  grantedConsentKey?: string;
  /**
   * The details of the proximity presentation containing the localized claims grouped by credential type
   */
  proximityDetails?: ProximityDetails;
  /**
   * The string used to generate the QR Code
   */
  qrCodeString?: string;
  /**
   * The retrieval mode used for the proximity presentation, either "nfc" or "ble".
   */
  retrievalMethod?: ISO18013_5.RetrievalMethod;
  /**
   * The Verifier Request returned from the Relying Party
   */
  verifierRequest?: VerifierRequest;
};

export const InitialContext: Context = {
  credentials: undefined,
  engagementMode: "qrcode",
  failure: undefined,
  proximityDetails: undefined,
  verifierRequest: undefined
};
