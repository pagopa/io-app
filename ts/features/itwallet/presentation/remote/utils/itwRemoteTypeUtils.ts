import { Credential } from "@pagopa/io-react-native-wallet";
import { ClaimDisplayFormat } from "../../../common/utils/itwClaimsUtils";

/**
 * Type for the raw parameters extracted from the QR code or the deep link.
 * These parameters need to be validated so can be invalid or null.
 */
export type ItwRemoteQrRawPayload =
  Parameters<Credential.Presentation.StartFlow>[number];

/**
 * Type for the parameters requested to start the presentation flow
 */
export type ItwRemoteRequestPayload =
  ReturnType<Credential.Presentation.StartFlow>;

/**
 * Alias for the Relying Party's Entity Configuration type
 */
export type RelyingPartyConfiguration = Awaited<
  ReturnType<Credential.Presentation.EvaluateRelyingPartyTrust>
>["rpConf"];

/**
 * Type representing the parsed DCQL query with the presentation details
 */
export type PresentationDetails = Awaited<
  ReturnType<Credential.Presentation.EvaluateDcqlQuery>
>;

/**
 * Type representing the presentation details with localized claims
 */
export type EnrichedPresentationDetails = Array<
  PresentationDetails[number] & { claimsToDisplay: Array<ClaimDisplayFormat> }
>;

/**
 * Type that defines a query conforming to the Digital Credentials Query Language
 */
export type DcqlQuery =
  Parameters<Credential.Presentation.EvaluateDcqlQuery>[1];

/**
 * Type that defines the structure of the body expected by the `sendAuthorizationErrorResponse`
 */
export type AuthErrorResponseBody = Parameters<
  typeof Credential.Presentation.sendAuthorizationErrorResponse
>[1];
