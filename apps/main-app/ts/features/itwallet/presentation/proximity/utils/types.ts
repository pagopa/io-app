import { ISO18013_5 } from "@pagopa/io-react-native-iso18013";

import { NonEmptyArray } from "../../../../../types/helpers";
import { ClaimDisplayFormat } from "../../../common/utils/itwClaimsUtils";

/** Alias type for AcceptedFields */
export type AcceptedFields = ISO18013_5.AcceptedFields;

/** Alias type for EventsPayload */
export type EventsPayload = ISO18013_5.EventsPayload;

/** Type representing the proximity details with localized claims */
export type ProximityDetails = NonEmptyArray<{
  claimsToDisplay: Array<ClaimDisplayFormat>;
  credentialType: string;
  rpId: string;
}>;

/** Alias type for RequestedDocument */
export type RequestedDocument = ISO18013_5.RequestedDocument;

/** Alias type for VerifierRequest */
export type VerifierRequest = ISO18013_5.VerifierRequest;
