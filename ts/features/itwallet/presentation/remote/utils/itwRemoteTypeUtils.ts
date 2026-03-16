import { RemotePresentation } from "@pagopa/io-react-native-wallet";
import { ClaimDisplayFormat } from "../../../common/utils/itwClaimsUtils";

type RemotePresentationApi = RemotePresentation.RemotePresentationApi;

/**
 * Type for the raw parameters extracted from the QR code or the deep link.
 * These parameters need to be validated so can be invalid or null.
 */
export type ItwRemoteQrRawPayload = Parameters<
  RemotePresentationApi["startFlowFromQR"]
>[number];

/**
 * Type for the parameters requested to start the presentation flow
 */
export type ItwRemoteRequestPayload = RemotePresentation.PresentationParams;

/**
 * Alias for the Relying Party's Entity Configuration type
 */
export type RelyingPartyConfiguration = RemotePresentation.RelyingPartyConfig;

/**
 * Type representing the parsed DCQL query with the presentation details
 */
export type PresentationDetails = Awaited<
  ReturnType<RemotePresentationApi["evaluateDcqlQuery"]>
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
export type DcqlQuery = Parameters<
  RemotePresentationApi["evaluateDcqlQuery"]
>[0];

/**
 * Type that defines the structure of the body expected by the `sendAuthorizationErrorResponse`
 */
export type AuthErrorResponseBody = Parameters<
  RemotePresentationApi["sendAuthorizationErrorResponse"]
>[1];
