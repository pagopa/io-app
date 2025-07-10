import { createSelector } from "reselect";
import { itwCredentialsSelector } from "../../../../credentials/store/selectors";
import { itwWalletInstanceAttestationSelector } from "../../../../walletInstance/store/selectors";
import { WIA_TYPE } from "../../utils/itwProximityPresentationUtils";
import { ProximityCredentials } from "../../utils/itwProximityTypeUtils";

/**
 * Returns a combined set of credentials and the WIA (`mso_mdoc`).
 */
export const itwProximityCredentialsByTypeSelector = createSelector(
  itwCredentialsSelector,
  itwWalletInstanceAttestationSelector,
  (credentials, wia): ProximityCredentials => ({
    ...credentials,
    [WIA_TYPE]: wia?.mso_mdoc
  })
);
