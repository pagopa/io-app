import { createSelector } from "reselect";
import { itwCredentialsSelector } from "../../../credentials/store/selectors";
import { itwLifecycleIsITWalletValidSelector } from "../../../lifecycle/store/selectors";
import { getMixPanelCredential } from "../../utils";
import { CREDENTIAL_STATUS_MAP, ItwCredentialDetails } from "../../utils/types";
import { getCredentialStatus } from "../../../common/utils/itwCredentialStatusUtils";

/**
 * Map all the credentials in the Wallet and their status to the corresponding MixPanel format.
 * @returns An object `{credential:status}` ready to be sent to MixPanel.
 * @example { "ITW_PG_V2": "valid", "ITW_TS_V3": "expired" }
 */
export const itwMixPanelCredentialDetailsSelector = createSelector(
  itwCredentialsSelector,
  itwLifecycleIsITWalletValidSelector,
  (credentials, isItwL3) =>
    Object.values(credentials).reduce<ItwCredentialDetails>(
      (acc, c) => ({
        ...acc,
        [getMixPanelCredential(c.credentialType, isItwL3)]:
          CREDENTIAL_STATUS_MAP[getCredentialStatus(c)]
      }),
      {}
    )
);
