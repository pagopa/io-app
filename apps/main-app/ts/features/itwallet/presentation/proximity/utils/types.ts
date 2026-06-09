import { ISO18013_5 } from "@pagopa/io-react-native-iso18013";
import { ClaimDisplayFormat } from "../../../common/utils/itwClaimsUtils";

/**
 * Alias type for AcceptedFields
 */
export type AcceptedFields = ISO18013_5.AcceptedFields;

/**
 * Alias type for EventsPayload
 */
export type EventsPayload = ISO18013_5.EventsPayload;

/**
 * Alias type for RequestedDocument
 */
export type RequestedDocument = ISO18013_5.RequestedDocument;

/**
 * Alias type for VerifierRequest
 */
export type VerifierRequest = ISO18013_5.VerifierRequest;

/**
 * Type representing the proximity details with localized claims
 */
export type ProximityDetails = Array<{
  credentialType: string;
  claimsToDisplay: Array<ClaimDisplayFormat>;
}>;
