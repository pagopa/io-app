import { Credential } from "@pagopa/io-react-native-wallet";
import { ClaimDisplayFormat } from "../../../common/utils/itwClaimsUtils";

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
