import { ISO18013_5 } from "@pagopa/io-react-native-iso18013";
import {
  CredentialMetadata,
  WalletInstanceAttestations
} from "../../../common/utils/itwTypesUtils";
import type {
  ProximityDetails,
  VerifierRequest
} from "../utils/itwProximityTypeUtils";
import { ProximityFailure } from "./failure";

export type Context = {
  /**
   * The wallet instance attestation of the wallet. If expired, it will be requested a new one.
   */
  walletInstanceAttestation: WalletInstanceAttestations | undefined;
  /**
   * The credentials available in the wallet, to be potentially shared with the Relying Party.
   */
  credentials: Record<string, CredentialMetadata> | undefined;
  /**
   * The string used to generate the QR Code
   */
  qrCodeString?: string;
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
   * A boolean value indicating whether the user has given consent
   * to share their credentials with the Relying Party
   */
  hasGivenConsent?: boolean;
};

export const InitialContext: Context = {
  walletInstanceAttestation: undefined,
  credentials: undefined,
  failure: undefined,
  proximityDetails: undefined,
  verifierRequest: undefined
};
