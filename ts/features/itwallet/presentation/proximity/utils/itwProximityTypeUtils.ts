import { ClaimDisplayFormat } from "../../../common/utils/itwClaimsUtils";

/**
 * Type representing the proximity details with localized claims
 */
export type ProximityDetails = Array<{
  credentialType: string;
  claimsToDisplay: Array<ClaimDisplayFormat>;
}>;
