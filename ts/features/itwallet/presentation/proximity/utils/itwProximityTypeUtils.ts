import { ClaimDisplayFormat } from "../../../common/utils/itwClaimsUtils";
import {
  StoredCredential,
  WalletInstanceAttestations
} from "../../../common/utils/itwTypesUtils";

/**
 * Type representing the proximity credentials
 * It is a record where the key is the credential type
 * and the value is either a Stored credential or a WIA (mso_mdoc)
 */
export type ProximityCredentials = {
  [credentialKey: string]:
    | StoredCredential
    | WalletInstanceAttestations["mso_mdoc"];
};

/**
 * Type representing the proximity details with localized claims
 */
export type ProximityDetails = Array<{
  credentialType: string;
  claimsToDisplay: Array<ClaimDisplayFormat>;
}>;
