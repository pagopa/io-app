import { createSelector } from "reselect";
import {
  itwCredentialsEidIssuedAtSelector,
  itwCredentialsSelector
} from "../../../credentials/store/selectors";
import { itwLifecycleIsITWalletValidSelector } from "../../../lifecycle/store/selectors";
import { getMixPanelCredential } from "../../utils";
import { CREDENTIAL_STATUS_MAP, ItwCredentialDetails } from "../../utils/types";
import { getCredentialStatus } from "../../../common/utils/itwCredentialStatusUtils";
import { isCredentialIssuedBeforePid } from "../../../common/utils/itwCredentialUtils";

/**
 * Map all the credentials in the Wallet and their status to the corresponding MixPanel format.
 * @returns An object `{credential:status}` ready to be sent to MixPanel.
 * @example { "ITW_PG_V2": "valid", "ITW_TS_V3": "expired" }
 */
export const itwMixPanelCredentialDetailsSelector = createSelector(
  itwCredentialsSelector,
  itwLifecycleIsITWalletValidSelector,
  itwCredentialsEidIssuedAtSelector,
  (credentials, isItwPid, pidIssuedAt) =>
    Object.values(credentials).reduce<ItwCredentialDetails>((acc, c) => {
      const isItwCredential =
        isItwPid && !isCredentialIssuedBeforePid(c.jwt.issuedAt, pidIssuedAt);
      return {
        ...acc,
        [getMixPanelCredential(c.credentialType, isItwCredential)]:
          CREDENTIAL_STATUS_MAP[getCredentialStatus(c)]
      };
    }, {})
);
