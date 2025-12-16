import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { GlobalState } from "../../../../store/reducers/types";
import { itwAuthLevelSelector } from "../../common/store/selectors/preferences";
import { getCredentialStatus } from "../../common/utils/itwCredentialStatusUtils";
import { isItwCredential } from "../../common/utils/itwCredentialUtils";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import {
  itwCredentialsEidStatusSelector,
  itwCredentialsSelector
} from "../../credentials/store/selectors";
import { itwLifecycleIsITWalletValidSelector } from "../../lifecycle/store/selectors";
import { ItwJwtCredentialStatus } from "../../common/utils/itwTypesUtils";
import { mapPIDStatusToMixpanel } from "../utils/analyticsUtils";
import {
  ItwStatus,
  ItwCredentialMixpanelStatus,
  CREDENTIAL_STATUS_MAP,
  ItwPIDStatus
} from "..";
import { ITWBaseProperties } from "./propertyTypes";

/**
 * Builds the base ITW properties for Mixpanel analytics.
 */
export const buildItwBaseProperties = (
  state: GlobalState
): ITWBaseProperties => {
  const isItwL3 = itwLifecycleIsITWalletValidSelector(state);

  const ITW_STATUS_V2 = getWalletStatus(state);
  const ITW_PID = getPIDMixpanelStatus(state, true);

  const ITW_PG_V3 = getMixpanelCredentialStatus(
    CredentialType.DRIVING_LICENSE,
    state,
    isItwL3
  );
  const ITW_TS_V3 = getMixpanelCredentialStatus(
    CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD,
    state,
    isItwL3
  );
  const ITW_CED_V3 = getMixpanelCredentialStatus(
    CredentialType.EUROPEAN_DISABILITY_CARD,
    state,
    isItwL3
  );

  const v2Props = !isItwL3
    ? {
        ITW_ID_V2: getPIDMixpanelStatus(state, false),
        ITW_PG_V2: getMixpanelCredentialStatus(
          CredentialType.DRIVING_LICENSE,
          state
        ),
        ITW_TS_V2: getMixpanelCredentialStatus(
          CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD,
          state
        ),
        ITW_CED_V2: getMixpanelCredentialStatus(
          CredentialType.EUROPEAN_DISABILITY_CARD,
          state
        )
      }
    : {};

  return {
    ITW_STATUS_V2,
    ITW_PID,
    ITW_PG_V3,
    ITW_TS_V3,
    ITW_CED_V3,
    ...v2Props
  };
};

// #region  Utility functions

/**
 * Returns the PID status for Mixpanel analytics.
 * - If `isL3` is true → we consider the status from the current L3 PID (IT Wallet).
 * - If `isL3` is false → we use the current eID status.
 */
export const getPIDMixpanelStatus = (
  state: GlobalState,
  isL3: boolean
): ItwPIDStatus =>
  pipe(
    isL3
      ? pipe(
          itwLifecycleIsITWalletValidSelector(state),
          O.fromPredicate(Boolean),
          O.chain(() => O.fromNullable(itwCredentialsEidStatusSelector(state)))
        )
      : O.fromNullable(itwCredentialsEidStatusSelector(state)),
    O.map<ItwJwtCredentialStatus, ItwPIDStatus>(mapPIDStatusToMixpanel),
    O.getOrElse((): ItwPIDStatus => "not_available")
  );

const getWalletStatus = (state: GlobalState): ItwStatus => {
  const authLevel = itwAuthLevelSelector(state);
  return authLevel ? authLevel : "not_active";
};

/**
 * Returns the Mixpanel status for a credential type, considering IT Wallet.
 * - If `isItwL3` is explicitly false, returns `"not_available"`.
 * - If `isItwL3` is true and the credential exists but is not an ITW credential, returns `"not_available"`.
 * - Otherwise, retrieves the credential from the store and maps it to Mixpanel status.
 * - Returns `"not_available"` if the credential is missing.
 */
const getMixpanelCredentialStatus = (
  type: CredentialType,
  state: GlobalState,
  isItwL3?: boolean
): ItwCredentialMixpanelStatus => {
  if (isItwL3 === false) {
    return "not_available";
  }
  const credential = itwCredentialsSelector(state)[type];
  if (isItwL3 && credential && !isItwCredential(credential)) {
    return "not_available";
  }

  return pipe(
    O.fromNullable(credential),
    O.map(cred => CREDENTIAL_STATUS_MAP[getCredentialStatus(cred)]),
    O.getOrElse(() => "not_available" as ItwCredentialMixpanelStatus)
  );
};

// #endregion
