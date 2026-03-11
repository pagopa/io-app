import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { GlobalState } from "../../../../store/reducers/types";
import { itwAuthLevelSelector } from "../../common/store/selectors/preferences";
import { getCredentialStatus } from "../../common/utils/itwCredentialStatusUtils";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import {
  itwCredentialsEidStatusSelector,
  itwCredentialsSelector
} from "../../credentials/store/selectors";
import { itwLifecycleIsITWalletValidSelector } from "../../lifecycle/store/selectors";
import { mapPIDStatusToMixpanel } from "../utils";
import {
  CREDENTIAL_STATUS_MAP,
  ItwCredentialMixpanelStatus
} from "../utils/types";
import { ItwBaseProperties } from "./propertyTypes";

/**
 * Builds the base ITW properties for Mixpanel analytics.
 */
export const buildItwBaseProperties = (
  state: GlobalState
): ItwBaseProperties => {
  const pidProps = buildPidProperties(state);
  const credentialProps = buildCredentialProperties(state);

  return {
    ITW_STATUS_V2: itwAuthLevelSelector(state) ?? "not_active",
    ...pidProps,
    ...credentialProps
  };
};

/**
 * Builds PID properties for Mixpanel analytics
 * IT-Wallet (L3) -> PID status is mapped to ITW_PID, while ITW_ID_V2 is not sent to preserve historical data.
 * Documenti su IO (L2) -> PID status is mapped to ITW_ID_V2, while ITW_PID shoul be "not_available".
 */
export const buildPidProperties = (state: GlobalState) => {
  const isItwL3 = itwLifecycleIsITWalletValidSelector(state);
  const pidStatus = itwCredentialsEidStatusSelector(state);

  const v2Props = {
    ITW_ID_V2: mapPIDStatusToMixpanel(pidStatus),
    ITW_PID: "not_available"
  } as const;

  const v3Props = {
    ITW_PID: mapPIDStatusToMixpanel(pidStatus)
  };

  return isItwL3 ? v3Props : v2Props;
};

/**
 * IT-Wallet (L3) -> V2 properties are not sent to preserve historical data.
 */
export const buildCredentialProperties = (state: GlobalState) => {
  const isItwL3 = itwLifecycleIsITWalletValidSelector(state);

  const v3Props = {
    ITW_PG_V3: getMixpanelCredentialStatus(
      CredentialType.DRIVING_LICENSE,
      state,
      isItwL3
    ),
    ITW_TS_V3: getMixpanelCredentialStatus(
      CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD,
      state,
      isItwL3
    ),
    ITW_CED_V3: getMixpanelCredentialStatus(
      CredentialType.EUROPEAN_DISABILITY_CARD,
      state,
      isItwL3
    )
  } as const;

  const v2Props = {
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
  } as const;

  // V3 props are always included, while V2 props are included only if IT-Wallet is not valid
  // to preserve historical data consistency.
  return isItwL3 ? { ...v3Props } : { ...v3Props, ...v2Props };
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

  return pipe(
    O.fromNullable(credential),
    O.map(cred => CREDENTIAL_STATUS_MAP[getCredentialStatus(cred)]),
    O.getOrElse(() => "not_available" as ItwCredentialMixpanelStatus)
  );
};
